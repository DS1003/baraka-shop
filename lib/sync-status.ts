import fs from 'fs'
import path from 'path'
import os from 'os'

export interface SyncLog {
    time: string
    message: string
    type: 'info' | 'success' | 'error'
}

export interface SyncStatus {
    isRunning: boolean
    type: 'MANUAL' | 'SCHEDULED' | null
    historyId: string | null
    progress: number
    step: string
    logs: SyncLog[]
    startedAt: string | null
    completedAt: string | null
    result: {
        productsUpdatedCount?: number
        productsCreatedCount?: number
        categoriesReassignedCount?: number
        categoriesSyncedCount?: number
        error?: string
    } | null
}

const DEFAULT_STATUS: SyncStatus = {
    isRunning: false,
    type: null,
    historyId: null,
    progress: 0,
    step: '',
    logs: [],
    startedAt: null,
    completedAt: null,
    result: null,
}

// Fichier temporaire partagé entre les workers Next.js (API et Instrumentation)
const STATUS_FILE = path.join(os.tmpdir(), 'baraka-sync-status.json')

export function getSyncStatus(): SyncStatus {
    try {
        if (fs.existsSync(STATUS_FILE)) {
            const data = fs.readFileSync(STATUS_FILE, 'utf-8')
            return JSON.parse(data)
        }
    } catch (e) {}
    return DEFAULT_STATUS
}

function saveSyncStatus(status: SyncStatus) {
    try {
        fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2))
    } catch (e) {}
}

function now(): string {
    return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function addSyncLog(message: string, type: SyncLog['type'] = 'info') {
    const status = getSyncStatus()
    status.logs.push({ time: now(), message, type })
    saveSyncStatus(status)
}

export function updateSyncProgress(progress: number, step: string) {
    const status = getSyncStatus()
    status.progress = progress
    status.step = step
    saveSyncStatus(status)
}

export function startSyncTracking(type: 'MANUAL' | 'SCHEDULED', historyId: string) {
    const status: SyncStatus = {
        isRunning: true,
        type,
        historyId,
        progress: 0,
        step: 'Démarrage de la synchronisation...',
        logs: [{ time: now(), message: 'Démarrage de la synchronisation FTP...', type: 'info' }],
        startedAt: new Date().toISOString(),
        completedAt: null,
        result: null,
    }
    saveSyncStatus(status)
}

export function completeSyncTracking(success: boolean, result?: SyncStatus['result']) {
    const status = getSyncStatus()
    status.isRunning = false
    status.completedAt = new Date().toISOString()
    status.progress = 100
    status.step = success ? 'Synchronisation terminée !' : 'Échec de la synchronisation'
    status.result = result || null
    saveSyncStatus(status)
}
