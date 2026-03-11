"use client"

import { useMemo, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Table2, Info } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import type { AnalysisResult, Utterance, Keyword } from "@/lib/analysis-types"

interface KeywordAnalysisProps {
  result: AnalysisResult
  utterances: Utterance[]
}

type MetricType = "jaccard" | "mi"

export function KeywordAnalysis({ result, utterances }: KeywordAnalysisProps) {
  const { language } = useLanguage()
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("jaccard")
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const tableRef = useRef<HTMLDivElement>(null)

  const t = language === "ja" ? {
    title: "キーワード分析",
    description: "授業記録の主要キーワード間の関係性を分析します",
    selectMetric: "指標を選択",
    jaccard: "ジャッカード係数",
    mi: "相互情報量",
    keywords: "キーワード一覧",
    selectKeywords: "分析するキーワードを選択（クリック）",
    selectedCount: "選択中",
    matrix: "マトリクス表示",
    exportCSV: "CSVエクスポート",
    exportJSON: "JSONエクスポート",
    frequency: "出現回数",
    importance: "重要度",
    noKeywords: "キーワードが抽出されていません",
    selectAtLeast2: "2つ以上のキーワードを選択してください",
    jaccardDesc: "2つのキーワードが同じ発言に出現する割合（0〜1、1に近いほど共起しやすい）",
    miDesc: "2つのキーワードの相互依存性（高いほど関連が強い）",
    clearSelection: "選択をクリア",
    selectAll: "すべて選択",
  } : {
    title: "Keyword Analysis",
    description: "Analyze relationships between key terms in the lesson",
    selectMetric: "Select Metric",
    jaccard: "Jaccard Coefficient",
    mi: "Mutual Information",
    keywords: "Keywords",
    selectKeywords: "Select keywords to analyze (click)",
    selectedCount: "Selected",
    matrix: "Matrix View",
    exportCSV: "Export CSV",
    exportJSON: "Export JSON",
    frequency: "Frequency",
    importance: "Importance",
    noKeywords: "No keywords extracted",
    selectAtLeast2: "Select at least 2 keywords",
    jaccardDesc: "Proportion of co-occurrence (0-1, higher = more co-occurrence)",
    miDesc: "Mutual dependency between keywords (higher = stronger relation)",
    clearSelection: "Clear Selection",
    selectAll: "Select All",
  }

  // Get keywords from result or extract from utterances
  const keywords: Keyword[] = useMemo(() => {
    if (result.keywords && result.keywords.length > 0) {
      return result.keywords.slice(0, 20)
    }
    
    // Fallback: extract keywords from utterances
    const wordCounts: Record<string, { count: number; utteranceIds: Set<number> }> = {}
    
    utterances.forEach(u => {
      // Simple Japanese word extraction (split by common delimiters)
      const words = u.content
        .replace(/[、。！？「」『』（）\s]/g, " ")
        .split(" ")
        .filter(w => w.length >= 2)
      
      words.forEach(word => {
        if (!wordCounts[word]) {
          wordCounts[word] = { count: 0, utteranceIds: new Set() }
        }
        wordCounts[word].count++
        wordCounts[word].utteranceIds.add(u.id)
      })
    })
    
    // Sort by frequency and take top 20
    return Object.entries(wordCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20)
      .map(([word, data], index) => ({
        word,
        frequency: data.count,
        utteranceIds: Array.from(data.utteranceIds),
        importance: 1 - (index / 20),
        category: "other" as const,
      }))
  }, [result.keywords, utterances])

  // Toggle keyword selection
  const toggleKeyword = (word: string) => {
    setSelectedKeywords(prev => 
      prev.includes(word) 
        ? prev.filter(w => w !== word)
        : [...prev, word]
    )
  }

  // Calculate Jaccard coefficient between two keywords
  const calculateJaccard = (keyword1: Keyword, keyword2: Keyword): number => {
    const set1 = new Set(keyword1.utteranceIds)
    const set2 = new Set(keyword2.utteranceIds)
    
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return union.size > 0 ? intersection.size / union.size : 0
  }

  // Calculate Mutual Information between two keywords
  const calculateMI = (keyword1: Keyword, keyword2: Keyword): number => {
    const totalUtterances = utterances.length
    if (totalUtterances === 0) return 0
    
    const set1 = new Set(keyword1.utteranceIds)
    const set2 = new Set(keyword2.utteranceIds)
    
    // P(X=1), P(Y=1)
    const p1 = set1.size / totalUtterances
    const p2 = set2.size / totalUtterances
    
    // P(X=1, Y=1) - joint probability
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const p11 = intersection.size / totalUtterances
    
    // Avoid log(0)
    if (p11 === 0 || p1 === 0 || p2 === 0) return 0
    
    // MI = P(X,Y) * log2(P(X,Y) / (P(X) * P(Y)))
    const mi = p11 * Math.log2(p11 / (p1 * p2))
    
    // Normalize to 0-1 range (approximate)
    return Math.max(0, Math.min(1, mi + 0.5))
  }

  // Calculate matrix
  const matrix = useMemo(() => {
    const selectedKws = keywords.filter(k => selectedKeywords.includes(k.word))
    if (selectedKws.length < 2) return null

    const matrixData: { row: string; values: { col: string; value: number }[] }[] = []
    
    selectedKws.forEach(kw1 => {
      const row: { col: string; value: number }[] = []
      selectedKws.forEach(kw2 => {
        let value: number
        if (kw1.word === kw2.word) {
          value = 1
        } else if (selectedMetric === "jaccard") {
          value = calculateJaccard(kw1, kw2)
        } else {
          value = calculateMI(kw1, kw2)
        }
        row.push({ col: kw2.word, value })
      })
      matrixData.push({ row: kw1.word, values: row })
    })

    return matrixData
  }, [keywords, selectedKeywords, selectedMetric])

  // Export functions
  const exportCSV = () => {
    if (!matrix) return
    
    const header = ["", ...matrix.map(r => r.row)].join(",")
    const rows = matrix.map(r => 
      [r.row, ...r.values.map(v => v.value.toFixed(4))].join(",")
    )
    
    const csv = [header, ...rows].join("\n")
    downloadFile(csv, `keyword-${selectedMetric}-matrix.csv`, "text/csv")
  }

  const exportJSON = () => {
    if (!matrix) return
    
    const data = {
      metric: selectedMetric,
      keywords: selectedKeywords,
      matrix: matrix.map(r => ({
        keyword: r.row,
        values: Object.fromEntries(r.values.map(v => [v.col, v.value]))
      }))
    }
    
    downloadFile(JSON.stringify(data, null, 2), `keyword-${selectedMetric}-matrix.json`, "application/json")
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Color scale for matrix cells
  const getColor = (value: number): string => {
    // Blue scale: lighter for low values, darker for high values
    const intensity = Math.round(value * 255)
    return `rgb(${255 - intensity}, ${255 - intensity * 0.5}, 255)`
  }

  if (keywords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table2 className="w-5 h-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t.noKeywords}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table2 className="w-5 h-5" />
            {t.title}
          </CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Metric Selection */}
          <div className="flex items-center gap-4">
            <Select value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as MetricType)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t.selectMetric} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jaccard">{t.jaccard}</SelectItem>
                <SelectItem value="mi">{t.mi}</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              {selectedMetric === "jaccard" ? t.jaccardDesc : t.miDesc}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keyword Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{t.keywords}</CardTitle>
              <CardDescription>{t.selectKeywords}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {t.selectedCount}: {selectedKeywords.length}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedKeywords([])}
              >
                {t.clearSelection}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedKeywords(keywords.map(k => k.word))}
              >
                {t.selectAll}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {keywords.map(kw => (
              <button
                key={kw.word}
                onClick={() => toggleKeyword(kw.word)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                  ${selectedKeywords.includes(kw.word)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                  }
                `}
              >
                {kw.word}
                <span className="ml-1.5 text-xs opacity-70">({kw.frequency})</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matrix Display */}
      {selectedKeywords.length >= 2 && matrix ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {t.matrix} - {selectedMetric === "jaccard" ? t.jaccard : t.mi}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportCSV}>
                  <Download className="w-4 h-4 mr-1" />
                  {t.exportCSV}
                </Button>
                <Button variant="outline" size="sm" onClick={exportJSON}>
                  <Download className="w-4 h-4 mr-1" />
                  {t.exportJSON}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={tableRef} className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="p-2 border bg-muted font-medium text-left"></th>
                    {matrix.map(r => (
                      <th 
                        key={r.row} 
                        className="p-2 border bg-muted font-medium text-center min-w-[80px]"
                        style={{ writingMode: "vertical-rl", textOrientation: "mixed", height: "100px" }}
                      >
                        {r.row}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map(row => (
                    <tr key={row.row}>
                      <th className="p-2 border bg-muted font-medium text-left whitespace-nowrap">
                        {row.row}
                      </th>
                      {row.values.map(cell => (
                        <td 
                          key={cell.col}
                          className="p-2 border text-center font-mono text-xs"
                          style={{ 
                            backgroundColor: getColor(cell.value),
                            color: cell.value > 0.5 ? "white" : "black"
                          }}
                          title={`${row.row} - ${cell.col}: ${cell.value.toFixed(4)}`}
                        >
                          {cell.value.toFixed(3)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Color legend */}
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span>0</span>
              <div 
                className="w-32 h-4 rounded"
                style={{ 
                  background: "linear-gradient(to right, rgb(255, 255, 255), rgb(0, 127, 255))" 
                }}
              />
              <span>1</span>
              <span className="ml-2">
                ({selectedMetric === "jaccard" ? t.jaccardDesc : t.miDesc})
              </span>
            </div>
          </CardContent>
        </Card>
      ) : selectedKeywords.length > 0 && selectedKeywords.length < 2 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t.selectAtLeast2}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
