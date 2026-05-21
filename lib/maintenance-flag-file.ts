import { readFileSync, writeFileSync } from 'fs'
import path from 'path'

const FILE_PATH = path.join(process.cwd(), 'public', 'maintenance.json')

export function readMaintenanceFlagFile(): boolean {
    try {
        const raw = readFileSync(FILE_PATH, 'utf-8')
        const data = JSON.parse(raw)
        return !!data.maintenanceMode
    } catch {
        return false
    }
}

export function writeMaintenanceFlagFile(enabled: boolean) {
    writeFileSync(
        FILE_PATH,
        JSON.stringify({ maintenanceMode: enabled }, null, 0),
        'utf-8'
    )
}
