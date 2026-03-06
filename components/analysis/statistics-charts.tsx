"use client"

import { useMemo, useRef, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, X } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import type { AnalysisResult, Utterance } from "@/lib/analysis-types"
import { calculateRelationDistribution, calculateEngagementTimeline } from "@/lib/analysis-utils"

interface StatisticsChartsProps {
  result: AnalysisResult
}

const COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#06b6d4", // cyan
]

const RELATION_COLORS: Record<string, string> = {
  agreement: "#22c55e",
  disagreement: "#ef4444",
  addition: "#3b82f6",
  paraphrase: "#8b5cf6",
  question: "#f59e0b",
  answer: "#06b6d4",
  topic_shift: "#ec4899",
  elaboration: "#64748b",
}

// Chart export utility
const exportChart = (chartRef: React.RefObject<HTMLDivElement | null>, filename: string, format: "png" | "jpg") => {
  if (!chartRef.current) return
  
  const svgElement = chartRef.current.querySelector("svg")
  if (!svgElement) return
  
  const svgData = new XMLSerializer().serializeToString(svgElement)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  
  const img = new Image()
  img.crossOrigin = "anonymous"
  img.onload = () => {
    canvas.width = img.width * 2
    canvas.height = img.height * 2
    ctx.scale(2, 2)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)
    
    const mimeType = format === "png" ? "image/png" : "image/jpeg"
    const link = document.createElement("a")
    link.download = `${filename}.${format}`
    link.href = canvas.toDataURL(mimeType, 0.95)
    link.click()
  }
  img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
}

function ExportButtons({ chartRef, filename }: { chartRef: React.RefObject<HTMLDivElement | null>; filename: string }) {
  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={() => exportChart(chartRef, filename, "png")}
      >
        <Download className="w-3 h-3 mr-1" />
        PNG
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={() => exportChart(chartRef, filename, "jpg")}
      >
        <Download className="w-3 h-3 mr-1" />
        JPG
      </Button>
    </div>
  )
}

// Component to display selected utterances
function UtteranceList({ 
  utterances, 
  title, 
  onClose,
  itemsLabel
}: { 
  utterances: Utterance[]
  title: string
  onClose: () => void
  itemsLabel: string
}) {
  if (utterances.length === 0) return null
  
  return (
    <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border/60">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-foreground">{title}（{utterances.length}{itemsLabel}）</p>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {utterances.map((u) => (
          <div key={u.id} className="text-xs p-2 bg-background rounded border border-border/40">
            <div className="flex items-center gap-2 mb-1">
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0"
                style={{ 
                  borderColor: u.speakerType === "teacher" ? "#3b82f6" : "#22c55e",
                  color: u.speakerType === "teacher" ? "#3b82f6" : "#22c55e"
                }}
              >
                {u.id}. {u.speaker}
              </Badge>
            </div>
            <p className="text-muted-foreground line-clamp-2">{u.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatisticsCharts({ result }: StatisticsChartsProps) {
  const { language } = useLanguage()
  const speakerChartRef = useRef<HTMLDivElement>(null)
  const centralityChartRef = useRef<HTMLDivElement>(null)
  const centralityTimelineRef = useRef<HTMLDivElement>(null)
  const relationPieRef = useRef<HTMLDivElement>(null)
  const topicChartRef = useRef<HTMLDivElement>(null)
  const engagementChartRef = useRef<HTMLDivElement>(null)
  const interventionTypeRef = useRef<HTMLDivElement>(null)
  const interventionImpactRef = useRef<HTMLDivElement>(null)

  // State for selected items
  const [selectedRelationType, setSelectedRelationType] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedInterventionType, setSelectedInterventionType] = useState<string | null>(null)
  const [selectedInterventionImpact, setSelectedInterventionImpact] = useState<string | null>(null)

  // Translations
  const content = {
    ja: {
      // Tabs
      speakerStats: "発言統計",
      centralityAnalysis: "中心性分析",
      relationDist: "関係性分布",
      engagementProgress: "関与度推移",
      teacherIntervention: "教師介入",
      // Speaker Stats
      speakerStatsTitle: "発言者別統計",
      speakerStatsDesc: "発言回数の多い順に並べ替え",
      utteranceCount: "発言回数",
      charCount: "文字数",
      // Centrality
      centralityTitle: "ネットワーク中心性分析",
      centralityDesc: "発言者ごとの議論への貢献度を複数の指標で評価",
      degreeCentrality: "次数中心性",
      betweennessCentrality: "媒介中心性",
      influenceCentrality: "影響力中心性",
      hubScore: "ハブスコア",
      centralityTimelineTitle: "中心性の時間推移",
      centralityTimelineDesc: "授業の進行に伴う累積中心性の変化（発言番号順）",
      cumulativeCentrality: "累積中心性",
      utteranceNumber: "発言番号",
      // Relations
      relationTypeTitle: "関係タイプ分布",
      clickToShow: "クリックで該当する発言を表示",
      topicCountTitle: "トピック別発言数",
      utterancesCount: "発言数",
      agreement: "同意",
      disagreement: "反対",
      addition: "付け足し",
      paraphrase: "言い換え",
      question: "質問",
      answer: "回答",
      topicShift: "話題転換",
      elaboration: "詳細化",
      // Engagement
      engagementTitle: "関与度・感情推移",
      engagementDesc: "授業の進行に伴う関与度と感情の変化",
      engagement: "関与度",
      sentiment: "感情",
      // Interventions
      interventionTypeTitle: "教師介入タイプ",
      interventionImpactTitle: "介入影響度",
      redirect: "方向転換",
      scaffold: "足場かけ",
      clarify: "明確化",
      validate: "承認",
      challenge: "挑戦",
      summarize: "要約",
      high: "高",
      medium: "中",
      low: "低",
      items: "件",
      topic: "トピック",
      utterancesOf: "の発言",
      impactLevel: "影響度",
    },
    en: {
      // Tabs
      speakerStats: "Speaker Stats",
      centralityAnalysis: "Centrality",
      relationDist: "Relations",
      engagementProgress: "Engagement",
      teacherIntervention: "Interventions",
      // Speaker Stats
      speakerStatsTitle: "Speaker Statistics",
      speakerStatsDesc: "Sorted by utterance count (descending)",
      utteranceCount: "Utterances",
      charCount: "Characters",
      // Centrality
      centralityTitle: "Network Centrality Analysis",
      centralityDesc: "Evaluate contribution to discussion with multiple metrics",
      degreeCentrality: "Degree",
      betweennessCentrality: "Betweenness",
      influenceCentrality: "Influence",
      hubScore: "Hub Score",
      centralityTimelineTitle: "Centrality Over Time",
      centralityTimelineDesc: "Cumulative centrality changes as the lesson progresses",
      cumulativeCentrality: "Cumulative",
      utteranceNumber: "Utterance #",
      // Relations
      relationTypeTitle: "Relation Type Distribution",
      clickToShow: "Click to show related utterances",
      topicCountTitle: "Utterances by Topic",
      utterancesCount: "Count",
      agreement: "Agreement",
      disagreement: "Disagreement",
      addition: "Addition",
      paraphrase: "Paraphrase",
      question: "Question",
      answer: "Answer",
      topicShift: "Topic Shift",
      elaboration: "Elaboration",
      // Engagement
      engagementTitle: "Engagement & Sentiment",
      engagementDesc: "Changes in engagement and sentiment as the lesson progresses",
      engagement: "Engagement",
      sentiment: "Sentiment",
      // Interventions
      interventionTypeTitle: "Teacher Intervention Types",
      interventionImpactTitle: "Intervention Impact",
      redirect: "Redirect",
      scaffold: "Scaffold",
      clarify: "Clarify",
      validate: "Validate",
      challenge: "Challenge",
      summarize: "Summarize",
      high: "High",
      medium: "Mid",
      low: "Low",
      items: " items",
      topic: "Topic",
      utterancesOf: " utterances",
      impactLevel: "Impact",
    }
  }
  
  const t = content[language]

  const RELATION_LABELS: Record<string, string> = {
    agreement: t.agreement,
    disagreement: t.disagreement,
    addition: t.addition,
    paraphrase: t.paraphrase,
    question: t.question,
    answer: t.answer,
    topic_shift: t.topicShift,
    elaboration: t.elaboration,
  }

  const TYPE_LABELS: Record<string, string> = {
    redirect: t.redirect,
    scaffold: t.scaffold,
    clarify: t.clarify,
    validate: t.validate,
    challenge: t.challenge,
    summarize: t.summarize,
  }

  // Sort speakers by utterance count (descending)
  const speakerData = useMemo(() => {
    return [...result.quantitativeMetrics.speakerStats]
      .sort((a, b) => b.utteranceCount - a.utteranceCount)
      .map((s) => ({
        name: s.speakerId,
        [t.utteranceCount]: s.utteranceCount,
        [t.charCount]: s.totalCharacters,
        type: s.speakerType,
      }))
  }, [result.quantitativeMetrics.speakerStats, t.utteranceCount, t.charCount])

  const centralityData = useMemo(() => {
    return result.quantitativeMetrics.networkMetrics.map((m) => ({
      name: m.speakerId,
      [t.degreeCentrality]: Math.round(m.degreeCentrality * 100),
      [t.betweennessCentrality]: Math.round(m.betweennessCentrality * 100),
      [t.influenceCentrality]: Math.round(m.influenceCentrality * 100),
      [t.hubScore]: Math.round(m.hubScore * 100),
    }))
  }, [result.quantitativeMetrics.networkMetrics, t.degreeCentrality, t.betweennessCentrality, t.influenceCentrality, t.hubScore])

  // Centrality over time (by utterance number)
  const centralityTimeline = useMemo(() => {
    const timeline: Array<{
      [key: string]: number | string
    }> = []
    
    const speakerCentrality: Record<string, number> = {}
    result.quantitativeMetrics.networkMetrics.forEach(m => {
      speakerCentrality[m.speakerId] = m.degreeCentrality + m.betweennessCentrality + m.influenceCentrality
    })
    
    let cumulativeCentrality = 0
    result.utterances.forEach((u) => {
      const contribution = (speakerCentrality[u.speaker] || 0) / result.utterances.filter(ut => ut.speaker === u.speaker).length
      cumulativeCentrality += contribution
      timeline.push({
        [t.utteranceNumber]: u.id,
        speaker: u.speaker,
        [t.cumulativeCentrality]: Math.round(cumulativeCentrality * 100) / 100,
      })
    })
    
    return timeline
  }, [result, t.utteranceNumber, t.cumulativeCentrality])

  const relationDistribution = useMemo(() => {
    const dist = calculateRelationDistribution(result.relations)
    return dist.map((d) => ({
      name: RELATION_LABELS[d.type] || d.type,
      type: d.type,
      value: d.count,
      color: RELATION_COLORS[d.type] || "#94a3b8",
    }))
  }, [result.relations, RELATION_LABELS])

  // Get utterances by relation type
  const utterancesByRelationType = useMemo(() => {
    if (!selectedRelationType) return []
    const relatedIds = new Set<number>()
    result.relations
      .filter(r => r.type === selectedRelationType)
      .forEach(r => {
        relatedIds.add(r.fromId)
        relatedIds.add(r.toId)
      })
    return result.utterances.filter(u => relatedIds.has(u.id))
  }, [result, selectedRelationType])

  const engagementTimeline = useMemo(() => {
    return calculateEngagementTimeline(result).map((e) => ({
      [t.utteranceNumber]: e.utteranceId,
      [t.engagement]: Math.round(e.engagement * 100),
      [t.sentiment]: Math.round((e.sentiment + 1) * 50),
      speaker: e.speaker,
    }))
  }, [result, t.utteranceNumber, t.engagement, t.sentiment])

  const topicData = useMemo(() => {
    return result.quantitativeMetrics.topicDurations.map((td) => ({
      name: td.topicName.length > 10 ? td.topicName.substring(0, 10) + "..." : td.topicName,
      fullName: td.topicName,
      topicId: td.topicId,
      [t.utterancesCount]: td.utteranceCount,
      duration: td.duration,
    }))
  }, [result.quantitativeMetrics.topicDurations, t.utterancesCount])

  // Get utterances by topic
  const utterancesByTopic = useMemo(() => {
    if (!selectedTopic) return []
    const topic = result.topics.find(t => t.id === selectedTopic)
    if (!topic) return []
    return result.utterances.filter(u => topic.utteranceIds.includes(u.id))
  }, [result, selectedTopic])

  const interventionData = useMemo(() => {
    const byType: Record<string, { count: number; utteranceIds: number[] }> = {}
    const byImpact: Record<string, { count: number; utteranceIds: number[] }> = {}
    
    result.quantitativeMetrics.teacherInterventions.forEach((i) => {
      if (!byType[i.type]) byType[i.type] = { count: 0, utteranceIds: [] }
      byType[i.type].count++
      byType[i.type].utteranceIds.push(i.utteranceId)
      
      if (!byImpact[i.impact]) byImpact[i.impact] = { count: 0, utteranceIds: [] }
      byImpact[i.impact].count++
      byImpact[i.impact].utteranceIds.push(i.utteranceId)
    })

    return {
      byType: Object.entries(byType).map(([type, data], index) => ({
        name: TYPE_LABELS[type] || type,
        type,
        value: data.count,
        utteranceIds: data.utteranceIds,
        color: COLORS[index % COLORS.length],
      })),
      byImpact: Object.entries(byImpact).map(([impact, data]) => ({
        name: impact === "high" ? t.high : impact === "medium" ? t.medium : t.low,
        impact,
        value: data.count,
        utteranceIds: data.utteranceIds,
        color: impact === "high" ? "#ef4444" : impact === "medium" ? "#f59e0b" : "#22c55e",
      })),
    }
  }, [result.quantitativeMetrics.teacherInterventions, TYPE_LABELS, t.high, t.medium, t.low])

  // Get utterances by intervention type
  const utterancesByInterventionType = useMemo(() => {
    if (!selectedInterventionType) return []
    const intervention = interventionData.byType.find(i => i.type === selectedInterventionType)
    if (!intervention) return []
    return result.utterances.filter(u => intervention.utteranceIds.includes(u.id))
  }, [result, selectedInterventionType, interventionData])

  // Get utterances by intervention impact
  const utterancesByInterventionImpact = useMemo(() => {
    if (!selectedInterventionImpact) return []
    const intervention = interventionData.byImpact.find(i => i.impact === selectedInterventionImpact)
    if (!intervention) return []
    return result.utterances.filter(u => intervention.utteranceIds.includes(u.id))
  }, [result, selectedInterventionImpact, interventionData])

  const handleRelationClick = (data: { type: string }) => {
    setSelectedRelationType(selectedRelationType === data.type ? null : data.type)
  }

  const handleTopicClick = (data: { topicId: string }) => {
    setSelectedTopic(selectedTopic === data.topicId ? null : data.topicId)
  }

  const handleInterventionTypeClick = (data: { type: string }) => {
    setSelectedInterventionType(selectedInterventionType === data.type ? null : data.type)
  }

  const handleInterventionImpactClick = (data: { impact: string }) => {
    setSelectedInterventionImpact(selectedInterventionImpact === data.impact ? null : data.impact)
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="speakers" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-muted/50">
          <TabsTrigger value="speakers" className="text-xs">{t.speakerStats}</TabsTrigger>
          <TabsTrigger value="centrality" className="text-xs">{t.centralityAnalysis}</TabsTrigger>
          <TabsTrigger value="relations" className="text-xs">{t.relationDist}</TabsTrigger>
          <TabsTrigger value="engagement" className="text-xs">{t.engagementProgress}</TabsTrigger>
          <TabsTrigger value="interventions" className="text-xs">{t.teacherIntervention}</TabsTrigger>
        </TabsList>

        <TabsContent value="speakers" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">{t.speakerStatsTitle}</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    {t.speakerStatsDesc}
                  </CardDescription>
                </div>
                <ExportButtons chartRef={speakerChartRef} filename="speaker-stats" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]" ref={speakerChartRef}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={speakerData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={80} 
                      tick={{ fontSize: 11, fill: "#334155" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        color: "#334155",
                      }}
                      labelStyle={{ color: "#334155" }}
                    />
                    <Legend wrapperStyle={{ color: "#334155" }} />
                    <Bar 
                      dataKey={t.utteranceCount} 
                      fill="#3b82f6" 
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar 
                      dataKey={t.charCount} 
                      fill="#22c55e" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="centrality" className="mt-4 space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">{t.centralityTitle}</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    {t.centralityDesc}
                  </CardDescription>
                </div>
                <ExportButtons chartRef={centralityChartRef} filename="centrality-radar" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]" ref={centralityChartRef}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={centralityData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: "#334155" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                    <Radar
                      name={t.degreeCentrality}
                      dataKey={t.degreeCentrality}
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name={t.betweennessCentrality}
                      dataKey={t.betweennessCentrality}
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name={t.influenceCentrality}
                      dataKey={t.influenceCentrality}
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.3}
                    />
                    <Legend wrapperStyle={{ color: "#334155" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        color: "#334155",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">{t.centralityTimelineTitle}</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    {t.centralityTimelineDesc}
                  </CardDescription>
                </div>
                <ExportButtons chartRef={centralityTimelineRef} filename="centrality-timeline" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]" ref={centralityTimelineRef}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={centralityTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey={t.utteranceNumber} 
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      label={{ value: t.utteranceNumber, position: "bottom", fontSize: 11, fill: "#64748b" }}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        color: "#334155",
                      }}
                      formatter={(value, name, props) => [value, `${name} (${props.payload.speaker})`]}
                    />
                    <Area
                      type="monotone"
                      dataKey={t.cumulativeCentrality}
                      fill="#3b82f6"
                      fillOpacity={0.2}
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relations" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">{t.relationTypeTitle}</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">
                      {t.clickToShow}
                    </CardDescription>
                  </div>
                  <ExportButtons chartRef={relationPieRef} filename="relation-distribution" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]" ref={relationPieRef}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={relationDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="value"
                        onClick={(data) => handleRelationClick(data)}
                        style={{ cursor: "pointer" }}
                      >
                        {relationDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={selectedRelationType === entry.type ? "#000" : "none"}
                            strokeWidth={selectedRelationType === entry.type ? 2 : 0}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          color: "#334155",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {selectedRelationType && (
                  <UtteranceList 
                    utterances={utterancesByRelationType}
                    title={`${RELATION_LABELS[selectedRelationType]}${t.utterancesOf}`}
                    onClose={() => setSelectedRelationType(null)}
                    itemsLabel={t.items}
                  />
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">{t.topicCountTitle}</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">
                      {t.clickToShow}
                    </CardDescription>
                  </div>
                  <ExportButtons chartRef={topicChartRef} filename="topic-distribution" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]" ref={topicChartRef}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#334155" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          color: "#334155",
                        }}
                        formatter={(value, name, props) => [value, props.payload.fullName || name]}
                      />
                      <Bar 
                        dataKey={t.utterancesCount} 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]}
                        onClick={(data) => handleTopicClick(data)}
                        style={{ cursor: "pointer" }}
                      >
                        {topicData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={selectedTopic === entry.topicId ? "#1d4ed8" : "#3b82f6"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {selectedTopic && (
                  <UtteranceList 
                    utterances={utterancesByTopic}
                    title={`${result.topics.find(tp => tp.id === selectedTopic)?.name || t.topic}${t.utterancesOf}`}
                    onClose={() => setSelectedTopic(null)}
                    itemsLabel={t.items}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="mt-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">{t.engagementTitle}</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    {t.engagementDesc}
                  </CardDescription>
                </div>
                <ExportButtons chartRef={engagementChartRef} filename="engagement-timeline" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]" ref={engagementChartRef}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey={t.utteranceNumber} 
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      label={{ value: t.utteranceNumber, position: "bottom", fontSize: 12, fill: "#64748b" }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        color: "#334155",
                      }}
                    />
                    <Legend wrapperStyle={{ color: "#334155" }} />
                    <Line
                      type="monotone"
                      dataKey={t.engagement}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#3b82f6" }}
                    />
                    <Line
                      type="monotone"
                      dataKey={t.sentiment}
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#22c55e" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interventions" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">{t.interventionTypeTitle}</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">
                      {t.clickToShow}
                    </CardDescription>
                  </div>
                  <ExportButtons chartRef={interventionTypeRef} filename="intervention-type" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]" ref={interventionTypeRef}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={interventionData.byType}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={70}
                        dataKey="value"
                        onClick={(data) => handleInterventionTypeClick(data)}
                        style={{ cursor: "pointer" }}
                      >
                        {interventionData.byType.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={selectedInterventionType === entry.type ? "#000" : "none"}
                            strokeWidth={selectedInterventionType === entry.type ? 2 : 0}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          color: "#334155",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {selectedInterventionType && (
                  <UtteranceList 
                    utterances={utterancesByInterventionType}
                    title={`${interventionData.byType.find(i => i.type === selectedInterventionType)?.name || ""}${t.utterancesOf}`}
                    onClose={() => setSelectedInterventionType(null)}
                    itemsLabel={t.items}
                  />
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">{t.interventionImpactTitle}</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">
                      {t.clickToShow}
                    </CardDescription>
                  </div>
                  <ExportButtons chartRef={interventionImpactRef} filename="intervention-impact" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]" ref={interventionImpactRef}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={interventionData.byImpact} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={40} 
                        tick={{ fontSize: 11, fill: "#334155" }} 
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          color: "#334155",
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={[0, 4, 4, 0]}
                        onClick={(data) => handleInterventionImpactClick(data)}
                        style={{ cursor: "pointer" }}
                      >
                        {interventionData.byImpact.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={selectedInterventionImpact === entry.impact ? "#000" : "none"}
                            strokeWidth={selectedInterventionImpact === entry.impact ? 2 : 0}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {selectedInterventionImpact && (
                  <UtteranceList 
                    utterances={utterancesByInterventionImpact}
                    title={`${t.impactLevel}${interventionData.byImpact.find(i => i.impact === selectedInterventionImpact)?.name || ""}${t.utterancesOf}`}
                    onClose={() => setSelectedInterventionImpact(null)}
                    itemsLabel={t.items}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
