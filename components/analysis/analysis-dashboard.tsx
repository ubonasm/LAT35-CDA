"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, RefreshCw, Key, ExternalLink } from "lucide-react"
import { CSVUpload } from "./csv-upload"
import { RelationNetwork } from "./relation-network"
import { StatisticsCharts } from "./statistics-charts"
import { TimelineView } from "./timeline-view"
import { SummaryCards } from "./summary-cards"
import { SegmentView } from "./segment-view"
import { ThemeNetwork } from "./theme-network"
import { KeywordAnalysis } from "./keyword-analysis"
import { TemporalAnalysis } from "./temporal-analysis"
import { useLanguage } from "@/lib/language-context"
import type { Utterance, AnalysisResult } from "@/lib/analysis-types"

const API_KEY_STORAGE_KEY = "gemini-api-key"

export function AnalysisDashboard() {
  const { t } = useLanguage()
  const [utterances, setUtterances] = useState<Utterance[] | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [needsApiKey, setNeedsApiKey] = useState(false)
  
  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY)
    if (savedKey) {
      setApiKey(savedKey)
    }
  }, [])

  const handleDataLoaded = async (data: Utterance[]) => {
    setUtterances(data)
    setError(null)
    setNeedsApiKey(false)
    await analyzeData(data)
  }
  
  const saveApiKey = (key: string) => {
    setApiKey(key)
    if (key) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key)
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY)
    }
  }

  const analyzeData = async (data: Utterance[]) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utterances: data, apiKey: apiKey || undefined }),
      })
      
      const responseData = await response.json()
      
      if (!response.ok) {
        if (responseData.needsApiKey) {
          setNeedsApiKey(true)
          setError(t("enterApiKey"))
          return
        }
        throw new Error(responseData.error || responseData.details || t("analysisError"))
      }

      setResult(responseData as AnalysisResult)
      setNeedsApiKey(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("analysisError")
      setError(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReanalyze = () => {
    if (utterances) {
      analyzeData(utterances)
    }
  }

  const handleExport = () => {
    if (!result) return

    const exportData = {
      exportedAt: new Date().toISOString(),
      summary: result.summary,
      utterances: result.utterances,
      relations: result.relations,
      topics: result.topics,
      codes: result.codes,
      quantitativeMetrics: result.quantitativeMetrics,
      hiddenInfluencers: result.hiddenInfluencers,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analysis-result-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setUtterances(null)
    setResult(null)
    setError(null)
  }

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* API Key Settings */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Key className="w-4 h-4" />
              {t("apiSettings")}
            </CardTitle>
            <CardDescription className="text-sm">
              {t("apiDescription")}
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline ml-1"
              >
                {t("getApiKey")}
                <ExternalLink className="w-3 h-3" />
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="apiKey" className="sr-only">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder={t("apiKeyPlaceholder")}
                  value={apiKey}
                  onChange={(e) => saveApiKey(e.target.value)}
                  className={needsApiKey && !apiKey ? "border-destructive" : ""}
                />
              </div>
              {apiKey && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => saveApiKey("")}
                  className="text-muted-foreground"
                >
                  {t("clear")}
                </Button>
              )}
            </div>
            {apiKey && (
              <p className="text-xs text-muted-foreground mt-2">
                {t("apiKeySaved")}
              </p>
            )}
          </CardContent>
        </Card>

        <CSVUpload onDataLoaded={handleDataLoaded} isLoading={isAnalyzing} />
        
        {isAnalyzing && (
          <div className="p-6 bg-card rounded-lg border border-border/60 text-center">
            <div className="flex items-center justify-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              <span className="text-foreground font-medium">{t("analyzing")}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t("analyzingDescription")}
            </p>
          </div>
        )}

        {error && !needsApiKey && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => utterances && analyzeData(utterances)}
            >
              {t("retry")}
            </Button>
          </div>
        )}

        {needsApiKey && utterances && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-foreground mb-3">
              {t("enterApiKey")}
            </p>
            <Button 
              size="sm" 
              onClick={() => analyzeData(utterances)}
              disabled={!apiKey || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  {t("analyzing")}
                </>
              ) : (
                t("startAnalysis")
              )}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {t("tabOverview")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {result.utterances.length} {t("totalUtterances").toLowerCase()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReanalyze} disabled={isAnalyzing}>
            <RefreshCw className={`w-4 h-4 mr-1 ${isAnalyzing ? "animate-spin" : ""}`} />
            {t("retry")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" />
            {t("exportJson")}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            {t("newAnalysis")}
          </Button>
        </div>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-8 bg-muted/50">
          <TabsTrigger value="overview">{t("tabOverview")}</TabsTrigger>
          <TabsTrigger value="temporal">{t("tabTemporal")}</TabsTrigger>
          <TabsTrigger value="segments">{t("tabSegments")}</TabsTrigger>
          <TabsTrigger value="themes">{t("tabThemes")}</TabsTrigger>
          <TabsTrigger value="keywords">{t("tabKeywords")}</TabsTrigger>
          <TabsTrigger value="network">{t("tabNetwork")}</TabsTrigger>
          <TabsTrigger value="statistics">{t("tabStatistics")}</TabsTrigger>
          <TabsTrigger value="timeline">{t("tabTimeline")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <SummaryCards result={result} />
        </TabsContent>

        <TabsContent value="temporal" className="mt-6">
          <TemporalAnalysis result={result} utterances={utterances || []} />
        </TabsContent>

        <TabsContent value="segments" className="mt-6">
          <SegmentView result={result} utterances={utterances || []} />
        </TabsContent>

        <TabsContent value="themes" className="mt-6">
          <ThemeNetwork result={result} utterances={utterances || []} />
        </TabsContent>

        <TabsContent value="keywords" className="mt-6">
          <KeywordAnalysis result={result} utterances={utterances || []} />
        </TabsContent>

        <TabsContent value="network" className="mt-6">
          <RelationNetwork result={result} />
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <StatisticsCharts result={result} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <TimelineView result={result} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
