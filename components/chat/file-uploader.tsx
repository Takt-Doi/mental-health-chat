'use client'

import { useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FileSpreadsheet, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HistoryEntry } from '@/lib/types'

interface FileUploaderProps {
  onUpload: (file: File) => Promise<void>
  isLoading: boolean
  error: string | null
  entries: HistoryEntry[]
  onClear: () => void
}

export function FileUploader({ onUpload, isLoading, error, entries, onClear }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await onUpload(file)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onUpload])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      await onUpload(file)
    }
  }, [onUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">過去の相談履歴をインポート</h3>
        {entries.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-xs">
            <X className="w-3 h-3 mr-1" />
            クリア
          </Button>
        )}
      </div>

      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center transition-colors',
          'hover:border-primary/50 hover:bg-primary/5',
          isLoading && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
        <FileSpreadsheet className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground mb-3">
          CSV または Excel ファイルをドラッグ&ドロップ
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <Upload className="w-4 h-4 mr-2" />
          ファイルを選択
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          対応形式: CSV, XLSX, XLS
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Uploaded entries summary */}
      {entries.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary">
              {entries.length} 件の履歴をインポートしました
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              この情報を参考に、より適切なサポートを行います
            </p>
          </div>
        </div>
      )}

      {/* Format guide */}
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer hover:text-foreground">
          ファイル形式について
        </summary>
        <div className="mt-2 p-3 bg-muted rounded-lg space-y-2">
          <p>以下のカラムを含むファイルを推奨します:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>日付</strong> (date): 相談日</li>
            <li><strong>カテゴリ</strong> (category): 相談種別</li>
            <li><strong>内容</strong> (summary): 相談内容の概要</li>
            <li><strong>キーワード</strong> (keywords): 関連キーワード（カンマ区切り）</li>
          </ul>
        </div>
      </details>
    </div>
  )
}
