import fs from 'fs'
import path from 'path'
import * as xlsx from 'xlsx'

const filePath = path.join(process.cwd(), 'tmp', 'ARTICLES_BARAKA.xlsx')

try {
    const stats = fs.statSync(filePath)
    console.log(`File size: ${stats.size} bytes`)
    
    try {
        const wb = xlsx.readFile(filePath)
        console.log('Successfully read with xlsx')
    } catch (e: any) {
        console.error('Error reading with xlsx:', e.message)
    }
} catch (e: any) {
    console.error('File does not exist or stat failed:', e.message)
}
