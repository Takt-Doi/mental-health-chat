'use client'

import { useState, useCallback } from 'react'
import type { HistoryEntry } from '@/lib/types'

interface UseFileUploadReturn {
  isLoading: boolean
  error: string | null
  entries: HistoryEntry[]
  uploadFile: (file: File) => Promise<void>
  clearEntries: () => void
}

export function useFileUpload(): UseFileUploadReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  const uploadFile = useCallback(async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      const fileName = file.name.toLowerCase()
      let parsedEntries: HistoryEntry[] = []

      if (fileName.endsWith('.csv')) {
        parsedEntries = await parseCSV(file)
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        parsedEntries = await parseExcel(file)
      } else {
        throw new Error('サポートされていないファイル形式です。CSV または Excel ファイルをアップロードしてください。')
      }

      setEntries(prev => [...prev, ...parsedEntries])
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'ファイルの読み込みに失敗しました'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearEntries = useCallback(() => {
    setEntries([])
    setError(null)
  }, [])

  return {
    isLoading,
    error,
    entries,
    uploadFile,
    clearEntries,
  }
}

async function parseCSV(file: File): Promise<HistoryEntry[]> {
  const text = await file.text()
  const lines = text.split('\n').filter(line => line.trim())
  
  if (lines.length < 2) {
    throw new Error('CSVファイルにデータがありません')
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const entries: HistoryEntry[] = []

  // Find column indices
  const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('日付'))
  const categoryIdx = headers.findIndex(h => h.includes('category') || h.includes('カテゴリ'))
  const summaryIdx = headers.findIndex(h => h.includes('summary') || h.includes('内容') || h.includes('概要'))
  const keywordsIdx = headers.findIndex(h => h.includes('keywords') || h.includes('キーワード'))

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    
    if (values.length === 0) continue

    entries.push({
      date: dateIdx >= 0 ? values[dateIdx] || '' : '',
      category: categoryIdx >= 0 ? values[categoryIdx] || '' : '',
      summary: summaryIdx >= 0 ? values[summaryIdx] || '' : values[0] || '',
      keywords: keywordsIdx >= 0 
        ? (values[keywordsIdx] || '').split(/[,;、]/).map(k => k.trim()).filter(Boolean)
        : [],
    })
  }

  return entries
}

function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  values.push(current.trim())
  return values
}

async function parseExcel(file: File): Promise<HistoryEntry[]> {
  // Dynamic import for xlsx library
  const XLSX = await import('xlsx')
  
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  
  const firstSheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[firstSheetName]
  
  const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, { 
    header: 1,
    defval: '' 
  }) as string[][]

  if (jsonData.length < 2) {
    throw new Error('Excelファイルにデータがありません')
  }

  const headers = jsonData[0].map(h => String(h).toLowerCase())
  const entries: HistoryEntry[] = []

  // Find column indices
  const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('日付'))
  const categoryIdx = headers.findIndex(h => h.includes('category') || h.includes('カテゴリ'))
  const summaryIdx = headers.findIndex(h => h.includes('summary') || h.includes('内容') || h.includes('概要'))
  const keywordsIdx = headers.findIndex(h => h.includes('keywords') || h.includes('キーワード'))

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i]
    if (!row || row.length === 0) continue

    entries.push({
      date: dateIdx >= 0 ? String(row[dateIdx] || '') : '',
      category: categoryIdx >= 0 ? String(row[categoryIdx] || '') : '',
      summary: summaryIdx >= 0 ? String(row[summaryIdx] || '') : String(row[0] || ''),
      keywords: keywordsIdx >= 0 
        ? String(row[keywordsIdx] || '').split(/[,;、]/).map(k => k.trim()).filter(Boolean)
        : [],
    })
  }

  return entries
}
