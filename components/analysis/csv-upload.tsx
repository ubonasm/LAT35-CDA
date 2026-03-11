"use client"

import { useState, useCallback } from "react"
import { Upload, FileText, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { parseCSV, type ParsedCSV } from "@/lib/csv-parser"
import { useLanguage } from "@/lib/language-context"
import type { Utterance } from "@/lib/analysis-types"

interface CSVUploadProps {
  onDataLoaded: (utterances: Utterance[]) => void
  isLoading?: boolean
}

export function CSVUpload({ onDataLoaded, isLoading }: CSVUploadProps) {
  const { t, language } = useLanguage()
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<Utterance[] | null>(null)

  const handleFile = useCallback(async (uploadedFile: File) => {
    setError(null)
    setFile(uploadedFile)

    try {
      const text = await uploadedFile.text()
      const result: ParsedCSV = parseCSV(text)

      if (result.errors.length > 0) {
        setError(result.errors.join("\n"))
        return
      }

      if (result.data.length === 0) {
        setError(language === "ja" ? "有効なデータが見つかりませんでした" : "No valid data found")
        return
      }

      setPreview(result.data.slice(0, 5))
      onDataLoaded(result.data)
    } catch (err) {
      const msg = language === "ja" ? "ファイルの読み込みに失敗しました" : "Failed to read file"
      setError(`${msg}: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }, [onDataLoaded, language])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "text/csv") {
      handleFile(droppedFile)
    } else {
      setError(language === "ja" ? "CSVファイルのみアップロード可能です" : "Only CSV files can be uploaded")
    }
  }, [handleFile, language])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFile(selectedFile)
    }
  }, [handleFile])

  const handleClear = () => {
    setFile(null)
    setPreview(null)
    setError(null)
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">{t("uploadTitle")}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {t("uploadDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!file ? (
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
              ${isDragging 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50 hover:bg-muted/30"
              }
            `}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
            />
            <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-1">
              {t("dragDropHere")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("orClickToSelect")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {preview ? `${preview.length}${t("utterancesData")}` : (language === "ja" ? "読み込み中..." : "Loading...")}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                disabled={isLoading}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {preview && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t("preview")}
                </p>
                <div className="bg-muted/20 rounded-lg border border-border/60 overflow-hidden">
                  <div className="max-h-48 overflow-y-auto">
                    {preview.map((u) => (
                      <div
                        key={u.id}
                        className="flex gap-3 p-3 border-b border-border/40 last:border-b-0 text-sm"
                      >
                        <span className="text-muted-foreground font-mono text-xs w-6 shrink-0">
                          {u.id}
                        </span>
                        <span className={`font-medium shrink-0 w-20 ${
                          u.speakerType === "teacher" ? "text-primary" : "text-accent"
                        }`}>
                          {u.speaker}
                        </span>
                        <span className="text-foreground/90 line-clamp-2">
                          {u.content}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm whitespace-pre-line">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/40">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{t("csvFormat")}:</span>{" "}
            {t("csvFormatDescription")}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
