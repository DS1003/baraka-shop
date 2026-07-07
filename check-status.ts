import fs from 'fs'
import path from 'path'
import os from 'os'

const STATUS_FILE = path.join(os.tmpdir(), 'baraka-sync-status.json')
console.log('File path:', STATUS_FILE)
if (fs.existsSync(STATUS_FILE)) {
    console.log('Content:', fs.readFileSync(STATUS_FILE, 'utf-8'))
} else {
    console.log('File does not exist.')
}
