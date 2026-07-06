import { Client } from 'basic-ftp'
import * as xlsx from 'xlsx'
import prisma from './prisma'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

export async function runFtpSync(type: 'MANUAL' | 'SCHEDULED' = 'MANUAL') {
    // 1. Fetch config
    const config = await prisma.syncConfig.findUnique({
        where: { id: 'singleton' }
    })

    if (!config || !config.isActive) {
        throw new Error("Configuration FTP non trouvée ou désactivée.")
    }

    if (!config.ftpServer || !config.ftpUser || !config.ftpPassword) {
        throw new Error("Identifiants FTP incomplets.")
    }

    // 2. Create history record
    const history = await prisma.syncHistory.create({
        data: {
            status: 'IN_PROGRESS',
            type,
        }
    })

    const client = new Client(60000) // 60 seconds timeout instead of default 30s
    client.ftp.verbose = false // Set to true for deep debugging if needed in prod

    let productsUpdatedCount = 0

    try {
        // 3. Connect to FTP
        await client.access({
            host: config.ftpServer,
            user: config.ftpUser,
            password: config.ftpPassword,
            secure: false, // Standard FTP assumed based on prompt
        })

        // 4. Download files from FTP
        // On Vercel, process.cwd() is read-only. We MUST use os.tmpdir() which maps to the writable /tmp folder.
        const tempDir = os.tmpdir()
        const articlesPath = path.join(tempDir, `ARTICLES_BARAKA_${Date.now()}.xlsx`)
        const categoriesPath = path.join(tempDir, `CATEGORIES_BARAKA_${Date.now()}.xlsx`)

        // Construct remote path
        const ftpDir = config.ftpPath || '/'

        // Check if files exist on FTP
        const list = await client.list(ftpDir)
        const articlesFile = list.find(file => file.name.toUpperCase() === 'ARTICLES_BARAKA.XLSX')
        const categoriesFile = list.find(file => file.name.toUpperCase() === 'CATEGORIES_BARAKA.XLSX')
        
        if (!articlesFile) {
            const availableFiles = list.filter(f => !f.isDirectory).map(f => f.name).join(', ') || 'Aucun fichier'
            throw new Error(`Le fichier ARTICLES_BARAKA.xlsx est introuvable dans le dossier FTP "${ftpDir}". Fichiers présents : ${availableFiles}`)
        }

        // Download ARTICLES_BARAKA.xlsx
        const exactArticlesPath = ftpDir.endsWith('/') ? `${ftpDir}${articlesFile.name}` : `${ftpDir}/${articlesFile.name}`
        await client.downloadTo(articlesPath, exactArticlesPath)

        // Download CATEGORIES_BARAKA.xlsx (if it exists)
        type FtpCategory = { id: string; name: string; parentId: string; image: string | null }
        const ftpCategories = new Map<string, FtpCategory>()
        let categoriesSyncedCount = 0

        if (categoriesFile) {
            const exactCategoriesPath = ftpDir.endsWith('/') ? `${ftpDir}${categoriesFile.name}` : `${ftpDir}/${categoriesFile.name}`
            await client.downloadTo(categoriesPath, exactCategoriesPath)

            try {
                const catBuffer = await fs.readFile(categoriesPath)
                const catWorkbook = xlsx.read(catBuffer, { type: 'buffer' })
                const catSheetName = catWorkbook.SheetNames[0]
                const catData = xlsx.utils.sheet_to_json<any>(catWorkbook.Sheets[catSheetName])

                for (const row of catData) {
                    const clNo = row['CL_No']
                    const clIntitule = row['CL_Intitule'] || row['CL_Intitul\u00e9']
                    const clParent = row['CL_NoParent']
                    const clImage = row['CL_Image'] || null
                    
                    if (clNo !== undefined && clIntitule) {
                        ftpCategories.set(String(clNo).trim(), {
                            id: String(clNo).trim(),
                            name: String(clIntitule).trim(),
                            parentId: clParent !== undefined && clParent !== null ? String(clParent).trim() : '0',
                            image: clImage ? String(clImage).trim() : null
                        })
                    }
                }
                console.log(`[SYNC] ${ftpCategories.size} catégories chargées depuis CATEGORIES_BARAKA.xlsx`)
            } catch (e) {
                console.warn('[SYNC] Impossible de lire CATEGORIES_BARAKA.xlsx, catégorie par défaut utilisée.', e)
            }
        } else {
            console.warn('[SYNC] CATEGORIES_BARAKA.xlsx non trouvé sur le FTP, catégorie par défaut utilisée.')
        }

        // Verify the articles file was actually downloaded and is accessible
        let fileBuffer: Buffer
        try {
            fileBuffer = await fs.readFile(articlesPath)
        } catch (e) {
            throw new Error(`Échec du téléchargement: le fichier n'a pas pu être lu localement.`)
        }

        // 5. Process Products
        const prodWorkbook = xlsx.read(fileBuffer, { type: 'buffer' })
        const prodSheetName = prodWorkbook.SheetNames[0]
        const prodData = xlsx.utils.sheet_to_json<any>(prodWorkbook.Sheets[prodSheetName])

        // Optimize: Fetch all existing product references in one query to avoid 10,000 sequential DB calls
        const allProducts = await prisma.product.findMany({ select: { id: true, reference: true, categoryId: true, subCategoryId: true, thirdLevelCategoryId: true } })
        const productMap = new Map()
        for (const p of allProducts) {
            if (p.reference) {
                productMap.set(p.reference.toLowerCase(), { id: p.id, categoryId: p.categoryId, subCategoryId: p.subCategoryId, thirdLevelCategoryId: p.thirdLevelCategoryId })
            }
        }

        // Ensure a default category exists for new imports (fallback only)
        let defaultCat = await prisma.category.findUnique({ where: { slug: 'import-ftp' } })
        if (!defaultCat) {
            defaultCat = await prisma.category.create({
                data: {
                    name: 'Produits Importés (FTP)',
                    slug: 'import-ftp',
                    isPublished: true
                }
            })
        }

        // Helper to generate safe unique slug
        const generateSlug = (name: string) => {
            const base = name.toLowerCase().replace(/[^a-z0-9\u00e0-\u00ff]+/g, '-').replace(/(^-|-$)+/g, '').substring(0, 80)
            return `${base}-${Date.now().toString(36)}`
        }

        // Map FTP category IDs (CL_No) to Database IDs (N1, N2, N3)
        type ResolvedDbCategory = {
            level: 1 | 2 | 3;
            categoryId: string;
            subCategoryId: string | null;
            thirdLevelCategoryId: string | null;
        }
        const resolvedCategoriesCache = new Map<string, ResolvedDbCategory>()

        if (ftpCategories.size > 0) {
            // Level 1
            const n1Categories = Array.from(ftpCategories.values()).filter(c => c.parentId === '0' || c.parentId === '')
            for (const n1 of n1Categories) {
                let dbCat = await prisma.category.findFirst({ where: { name: { equals: n1.name, mode: 'insensitive' } } })
                if (!dbCat) {
                    dbCat = await prisma.category.create({
                        data: { name: n1.name, slug: generateSlug(n1.name), image: n1.image, isPublished: true }
                    })
                    categoriesSyncedCount++
                }
                resolvedCategoriesCache.set(n1.id, { level: 1, categoryId: dbCat.id, subCategoryId: null, thirdLevelCategoryId: null })
            }

            // Level 2
            const n2Categories = Array.from(ftpCategories.values()).filter(c => resolvedCategoriesCache.has(c.parentId))
            for (const n2 of n2Categories) {
                const parentN1 = resolvedCategoriesCache.get(n2.parentId)!
                let dbSubCat = await prisma.subCategory.findFirst({
                    where: { name: { equals: n2.name, mode: 'insensitive' }, categoryId: parentN1.categoryId }
                })
                if (!dbSubCat) {
                    dbSubCat = await prisma.subCategory.create({
                        data: { name: n2.name, slug: generateSlug(n2.name), categoryId: parentN1.categoryId }
                    })
                    categoriesSyncedCount++
                }
                resolvedCategoriesCache.set(n2.id, { level: 2, categoryId: parentN1.categoryId, subCategoryId: dbSubCat.id, thirdLevelCategoryId: null })
            }

            // Level 3
            const n3Categories = Array.from(ftpCategories.values()).filter(c => {
                const parent = resolvedCategoriesCache.get(c.parentId)
                return parent && parent.level === 2
            })
            for (const n3 of n3Categories) {
                const parentN2 = resolvedCategoriesCache.get(n3.parentId)!
                let dbThirdCat = await prisma.thirdLevelCategory.findFirst({
                    where: { name: { equals: n3.name, mode: 'insensitive' }, subCategoryId: parentN2.subCategoryId! }
                })
                if (!dbThirdCat) {
                    dbThirdCat = await prisma.thirdLevelCategory.create({
                        data: { name: n3.name, slug: generateSlug(n3.name), subCategoryId: parentN2.subCategoryId! }
                    })
                    categoriesSyncedCount++
                }
                resolvedCategoriesCache.set(n3.id, { level: 3, categoryId: parentN2.categoryId, subCategoryId: parentN2.subCategoryId, thirdLevelCategoryId: dbThirdCat.id })
            }
            
            console.log(`[SYNC] Hiérarchie de catégories construite. Nouveaux créés: ${categoriesSyncedCount}`)
        }

        const updateValues = []
        const createValues: any[] = []
        let categoriesReassignedCount = 0

        for (const row of prodData) {
            const ref = row['AR_Ref'] || row['Reference'] || row['Ref'] || row['REFERENCE'] || row['reference'] || row['Code']
            const price = row['PV_CAT_01'] || row['Price'] || row['Prix'] || row['PRICE'] || row['prix']
            const stock = row['STOCK'] || row['Stock'] || row['Quantite'] || row['Qte'] || row['stock'] || row['Quantity']
            const name = row['AR_Design'] || row['Designation'] || row['Nom'] || row['Name'] || row['NAME'] || row['name']
            const categoryNo = row['CATEGORIE'] || row['Categorie'] || row['categorie']

            // Resolve the real hierarchical category
            let resolvedCat: ResolvedDbCategory | null = null
            if (categoryNo !== undefined && categoryNo !== null && ftpCategories.size > 0) {
                resolvedCat = resolvedCategoriesCache.get(String(categoryNo).trim()) || null
            }
            
            if (ref) {
                const existing = productMap.get(String(ref).toLowerCase())
                if (existing) {
                    const updateData: any = { id: existing.id }
                    
                    if (price !== undefined && price !== null) {
                        const parsedPrice = parseFloat(String(price).replace(',', '.'))
                        if (!isNaN(parsedPrice)) updateData.price = parsedPrice
                    }
                    
                    if (stock !== undefined && stock !== null) {
                        const parsedStock = parseInt(String(stock), 10)
                        if (!isNaN(parsedStock)) updateData.stock = parsedStock
                    }

                    // Update categories if resolved and different
                    if (resolvedCat) {
                        if (
                            existing.categoryId !== resolvedCat.categoryId || 
                            existing.subCategoryId !== resolvedCat.subCategoryId || 
                            existing.thirdLevelCategoryId !== resolvedCat.thirdLevelCategoryId
                        ) {
                            updateData.categoryId = resolvedCat.categoryId
                            updateData.subCategoryId = resolvedCat.subCategoryId || null
                            updateData.thirdLevelCategoryId = resolvedCat.thirdLevelCategoryId || null
                            categoriesReassignedCount++
                        }
                    } else if (existing.categoryId === defaultCat.id) {
                         // Still on default category, wait for resolving later if needed, nothing to update
                    }

                    if (updateData.price !== undefined || updateData.stock !== undefined || updateData.categoryId !== undefined) {
                        updateValues.push(updateData)
                    }
                } else if (name) {
                    let parsedPrice = 0
                    if (price !== undefined && price !== null) {
                        parsedPrice = parseFloat(String(price).replace(',', '.'))
                        if (isNaN(parsedPrice)) parsedPrice = 0
                    }
                    let parsedStock = 0
                    if (stock !== undefined && stock !== null) {
                        parsedStock = parseInt(String(stock), 10)
                        if (isNaN(parsedStock)) parsedStock = 0
                    }

                    // Create a unique slug using the reference to avoid conflicts
                    const safeName = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                    const newSlug = `${safeName}-${String(ref).toLowerCase()}`.substring(0, 100)

                    createValues.push({
                        name: String(name).trim(),
                        slug: newSlug,
                        reference: String(ref).trim(),
                        price: parsedPrice,
                        stock: parsedStock,
                        categoryId: resolvedCat ? resolvedCat.categoryId : defaultCat.id,
                        subCategoryId: resolvedCat ? resolvedCat.subCategoryId : null,
                        thirdLevelCategoryId: resolvedCat ? resolvedCat.thirdLevelCategoryId : null,
                        isPublished: false,
                        isNew: true
                    })
                }
            }
        }

        // Execute raw SQL updates in batches to prevent memory and connection timeout issues
        const CHUNK_SIZE = 1000
        for (let i = 0; i < updateValues.length; i += CHUNK_SIZE) {
            const chunk = updateValues.slice(i, i + CHUNK_SIZE)
            let sql = ''
            for (const item of chunk) {
                let sets = []
                if (item.price !== undefined) sets.push(`"price" = ${item.price}`)
                if (item.stock !== undefined) sets.push(`"stock" = ${item.stock}`)
                if (item.categoryId !== undefined) sets.push(`"categoryId" = '${item.categoryId}'`)
                
                // Handle potentially null relations for raw SQL
                if (item.subCategoryId !== undefined) {
                    sets.push(`"subCategoryId" = ${item.subCategoryId ? `'${item.subCategoryId}'` : 'NULL'}`)
                }
                if (item.thirdLevelCategoryId !== undefined) {
                    sets.push(`"thirdLevelCategoryId" = ${item.thirdLevelCategoryId ? `'${item.thirdLevelCategoryId}'` : 'NULL'}`)
                }

                if (sets.length > 0) {
                    sql += `UPDATE "Product" SET ${sets.join(', ')} WHERE "id" = '${item.id}';\n`
                    productsUpdatedCount++
                }
            }
            if (sql) {
                await prisma.$executeRawUnsafe(sql)
            }
        }

        // Bulk insert new products
        let productsCreatedCount = 0
        if (createValues.length > 0) {
            // Process in chunks to avoid large query errors
            const INSERT_CHUNK = 500
            for (let i = 0; i < createValues.length; i += INSERT_CHUNK) {
                const chunk = createValues.slice(i, i + INSERT_CHUNK)
                const res = await prisma.product.createMany({
                    data: chunk,
                    skipDuplicates: true
                })
                productsCreatedCount += res.count
            }
        }

        console.log(`[SYNC] Cat\u00e9gories r\u00e9assign\u00e9es: ${categoriesReassignedCount}`)

        // Cleanup temp files
        await fs.unlink(articlesPath).catch(() => {})
        await fs.unlink(categoriesPath).catch(() => {})

        // 6. Success
        await prisma.syncHistory.update({
            where: { id: history.id },
            data: {
                status: 'SUCCESS',
                productsUpdated: productsUpdatedCount,
                categoriesUpdated: productsCreatedCount,
                completedAt: new Date(),
                errorDetails: `Mis à jour: ${productsUpdatedCount} | Créés: ${productsCreatedCount} | Catégories hiérarchiques: ${categoriesReassignedCount} réassignées, ${categoriesSyncedCount} crées/mises à jour.`
            }
        })

        return { success: true, productsUpdatedCount, productsCreatedCount, categoriesReassignedCount, categoriesSyncedCount }

    } catch (error: any) {
        // 8. Error
        await prisma.syncHistory.update({
            where: { id: history.id },
            data: {
                status: 'ERROR',
                errorDetails: error.message || "Erreur inconnue",
                completedAt: new Date()
            }
        })
        throw error
    } finally {
        client.close()
    }
}
