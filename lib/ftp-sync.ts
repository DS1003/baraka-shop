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

    const client = new Client()
    // client.ftp.verbose = true // Uncomment for debugging

    let productsUpdatedCount = 0

    try {
        // 3. Connect to FTP
        await client.access({
            host: config.ftpServer,
            user: config.ftpUser,
            password: config.ftpPassword,
            secure: false, // Standard FTP assumed based on prompt
        })

        // 4. Download product file
        const tempDir = path.join(process.cwd(), 'tmp')
        await fs.mkdir(tempDir, { recursive: true }).catch(() => {})
        const articlesPath = path.join(tempDir, 'ARTICLES_BARAKA.xlsx')

        // Construct remote path
        const ftpDir = config.ftpPath || '/'
        const remoteArticlesPath = ftpDir.endsWith('/') 
            ? `${ftpDir}ARTICLES_BARAKA.xlsx` 
            : `${ftpDir}/ARTICLES_BARAKA.xlsx`

        // Check if file exists on FTP
        const list = await client.list(ftpDir)
        const fileExists = list.find(file => file.name.toUpperCase() === 'ARTICLES_BARAKA.XLSX')
        
        if (!fileExists) {
            const availableFiles = list.filter(f => !f.isDirectory).map(f => f.name).join(', ') || 'Aucun fichier'
            throw new Error(`Le fichier ARTICLES_BARAKA.xlsx est introuvable dans le dossier FTP "${ftpDir}". Fichiers présents : ${availableFiles}`)
        }

        // Use the exact case from the server just in case
        const exactRemotePath = ftpDir.endsWith('/') ? `${ftpDir}${fileExists.name}` : `${ftpDir}/${fileExists.name}`

        await client.downloadTo(articlesPath, exactRemotePath)

        // Verify the file was actually downloaded and is accessible
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
        const allProducts = await prisma.product.findMany({ select: { id: true, reference: true } })
        const productMap = new Map()
        for (const p of allProducts) {
            if (p.reference) {
                productMap.set(p.reference.toLowerCase(), p.id)
            }
        }

        const updateValues = []

        for (const row of prodData) {
            const ref = row['AR_Ref'] || row['Reference'] || row['Ref'] || row['REFERENCE'] || row['reference'] || row['Code']
            const price = row['PV_CAT_02'] || row['Price'] || row['Prix'] || row['PRICE'] || row['prix']
            const stock = row['STOCK'] || row['Stock'] || row['Quantite'] || row['Qte'] || row['stock'] || row['Quantity']
            
            if (ref) {
                const existingId = productMap.get(String(ref).toLowerCase())
                if (existingId) {
                    const updateData: any = { id: existingId }
                    
                    if (price !== undefined && price !== null) {
                        const parsedPrice = parseFloat(String(price).replace(',', '.'))
                        if (!isNaN(parsedPrice)) updateData.price = parsedPrice
                    }
                    
                    if (stock !== undefined && stock !== null) {
                        const parsedStock = parseInt(String(stock), 10)
                        if (!isNaN(parsedStock)) updateData.stock = parsedStock
                    }

                    if (updateData.price !== undefined || updateData.stock !== undefined) {
                        updateValues.push(updateData)
                    }
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
                if (sets.length > 0) {
                    sql += `UPDATE "Product" SET ${sets.join(', ')} WHERE "id" = '${item.id}';\n`
                    productsUpdatedCount++
                }
            }
            if (sql) {
                await prisma.$executeRawUnsafe(sql)
            }
        }

        // Cleanup temp file
        await fs.unlink(articlesPath).catch(() => {})

        // 6. Success
        await prisma.syncHistory.update({
            where: { id: history.id },
            data: {
                status: 'SUCCESS',
                productsUpdated: productsUpdatedCount,
                categoriesUpdated: 0,
                completedAt: new Date()
            }
        })

        return { success: true, productsUpdatedCount }

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
