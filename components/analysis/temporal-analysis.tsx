"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts"
import type { 
  AnalysisResult, 
  Utterance,
  activityPatternLabels,
  evolutionTypeLabels,
  turningPointTypeLabels,
} from "@/lib/analysis-types"

interface TemporalAnalysisProps {
  result: AnalysisResult
  utterances: Utterance[]
}

const phaseColors = ["#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"]
const activityPatternColors: Record<string, string> = {
  early_active: "#3b82f6",
  late_active: "#8b5cf6",
  consistent: "#22c55e",
  intermittent: "#f59e0b",
  single_burst: "#ef4444",
}

const evolutionTypeColors: Record<string, string> = {
  abstraction: "#8b5cf6",
  concretization: "#22c55e",
  synonym: "#3b82f6",
  refinement: "#f59e0b",
}

const impactColors: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
}

export function TemporalAnalysis({ result, utterances }: TemporalAnalysisProps) {
  const { language } = useLanguage()
  
  const t = useMemo(() => ({
    title: language === "ja" ? "時系列分析" : "Temporal Analysis",
    description: language === "ja" 
      ? "授業の時間経過に伴う変化を分析します" 
      : "Analyzes changes over the course of the lesson",
    phases: language === "ja" ? "フェーズ分析" : "Phase Analysis",
    phasesDesc: language === "ja" 
      ? "授業を時間的なフェーズに分け、各フェーズの特徴を分析" 
      : "Divides the lesson into temporal phases and analyzes characteristics",
    conceptEvolution: language === "ja" ? "語の概念変遷" : "Concept Evolution",
    conceptEvolutionDesc: language === "ja" 
      ? "授業中に語がどのように変化・発展したか" 
      : "How terms evolved and developed during the lesson",
    speakerActivity: language === "ja" ? "話者活動の推移" : "Speaker Activity Shifts",
    speakerActivityDesc: language === "ja" 
      ? "各話者の発言がどの時点で活発になったか" 
      : "When each speaker became most active",
    turningPoints: language === "ja" ? "転換点" : "Turning Points",
    turningPointsDesc: language === "ja" 
      ? "授業の流れを変えた重要な発言" 
      : "Key utterances that changed the flow of discussion",
    noData: language === "ja" ? "時系列分析データがありません" : "No temporal analysis data available",
    utterance: language === "ja" ? "発言" : "Utterance",
    from: language === "ja" ? "から" : "from",
    to: language === "ja" ? "へ" : "to",
    speaker: language === "ja" ? "発言者" : "Speaker",
    pattern: language === "ja" ? "パターン" : "Pattern",
    phase: language === "ja" ? "フェーズ" : "Phase",
    impact: language === "ja" ? "影響度" : "Impact",
    // Activity patterns
    early_active: language === "ja" ? "序盤活発" : "Early Active",
    late_active: language === "ja" ? "終盤活発" : "Late Active",
    consistent: language === "ja" ? "一貫して活発" : "Consistent",
    intermittent: language === "ja" ? "断続的" : "Intermittent",
    single_burst: language === "ja" ? "一時的活発" : "Single Burst",
    // Evolution types
    abstraction: language === "ja" ? "抽象化" : "Abstraction",
    concretization: language === "ja" ? "具体化" : "Concretization",
    synonym: language === "ja" ? "同義語化" : "Synonym",
    refinement: language === "ja" ? "精緻化" : "Refinement",
    // Turning point types
    topic_shift: language === "ja" ? "話題転換" : "Topic Shift",
    concept_introduction: language === "ja" ? "概念導入" : "Concept Introduction",
    consensus_building: language === "ja" ? "合意形成" : "Consensus Building",
    controversy: language === "ja" ? "論争" : "Controversy",
    resolution: language === "ja" ? "解決" : "Resolution",
    // Impact levels
    high: language === "ja" ? "高" : "High",
    medium: language === "ja" ? "中" : "Medium",
    low: language === "ja" ? "低" : "Low",
  }), [language])

  const temporalAnalysis = result.temporalAnalysis

  // Prepare activity chart data
  const activityChartData = useMemo(() => {
    if (!temporalAnalysis?.phases || !temporalAnalysis?.speakerActivityShifts) return []
    
    const phases = temporalAnalysis.phases
    const shifts = temporalAnalysis.speakerActivityShifts
    
    return phases.map((phase, index) => {
      const dataPoint: Record<string, number | string> = {
        name: `${t.phase} ${phase.phaseId}`,
        phase: phase.phaseName,
      }
      
      shifts.forEach(shift => {
        dataPoint[shift.speakerId] = shift.activityByPhase[index] || 0
      })
      
      return dataPoint
    })
  }, [temporalAnalysis, t.phase])

  // Get unique speakers for chart
  const speakers = useMemo(() => {
    if (!temporalAnalysis?.speakerActivityShifts) return []
    return temporalAnalysis.speakerActivityShifts.map(s => s.speakerId)
  }, [temporalAnalysis])

  // Turning points timeline data
  const turningPointsData = useMemo(() => {
    if (!temporalAnalysis?.turningPoints) return []
    return temporalAnalysis.turningPoints.map(tp => ({
      ...tp,
      utterance: utterances.find(u => u.id === tp.utteranceId),
    }))
  }, [temporalAnalysis, utterances])

  if (!temporalAnalysis) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          {t.noData}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Phase Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t.phases}</CardTitle>
          <CardDescription>{t.phasesDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {temporalAnalysis.phases.map((phase, index) => (
              <div 
                key={phase.phaseId}
                className="p-4 rounded-lg border"
                style={{ borderLeftWidth: 4, borderLeftColor: phaseColors[index % phaseColors.length] }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      style={{ backgroundColor: phaseColors[index % phaseColors.length] }}
                      className="text-white"
                    >
                      {t.phase} {phase.phaseId}
                    </Badge>
                    <span className="font-medium">{phase.phaseName}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {t.utterance} {phase.startUtteranceId} - {phase.endUtteranceId}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{phase.characteristics}</p>
                <div className="flex flex-wrap gap-2">
                  {phase.dominantSpeakers.map(speaker => (
                    <Badge key={speaker} variant="outline" className="text-xs">
                      {speaker}
                    </Badge>
                  ))}
                  {phase.keyKeywords.map(keyword => (
                    <Badge key={keyword} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Speaker Activity Chart */}
      {activityChartData.length > 0 && speakers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.speakerActivity}</CardTitle>
            <CardDescription>{t.speakerActivityDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "white", 
                      border: "1px solid #e5e7eb",
                      borderRadius: 8
                    }} 
                  />
                  <Legend />
                  {speakers.map((speaker, index) => (
                    <Area
                      key={speaker}
                      type="monotone"
                      dataKey={speaker}
                      stackId="1"
                      stroke={phaseColors[index % phaseColors.length]}
                      fill={phaseColors[index % phaseColors.length]}
                      fillOpacity={0.6}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Activity patterns */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {temporalAnalysis.speakerActivityShifts.map(shift => (
                <div 
                  key={shift.speakerId}
                  className="p-3 rounded-lg border bg-muted/30"
                >
                  <div className="font-medium text-sm">{shift.speakerId}</div>
                  <Badge 
                    className="mt-1 text-xs text-white"
                    style={{ backgroundColor: activityPatternColors[shift.activityPattern] }}
                  >
                    {t[shift.activityPattern as keyof typeof t]}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">{shift.significance}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Concept Evolution */}
      {temporalAnalysis.conceptEvolution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.conceptEvolution}</CardTitle>
            <CardDescription>{t.conceptEvolutionDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {temporalAnalysis.conceptEvolution.map((evolution, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-muted/20"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Badge variant="outline" className="text-base px-3 py-1">
                      {evolution.initialTerm}
                    </Badge>
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-4" viewBox="0 0 32 16">
                        <path 
                          d="M0 8 L24 8 M20 4 L28 8 L20 12" 
                          stroke={evolutionTypeColors[evolution.evolutionType]}
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                      <Badge 
                        className="text-xs text-white mt-1"
                        style={{ backgroundColor: evolutionTypeColors[evolution.evolutionType] }}
                      >
                        {t[evolution.evolutionType as keyof typeof t]}
                      </Badge>
                    </div>
                    <Badge className="text-base px-3 py-1 bg-primary text-primary-foreground">
                      {evolution.evolvedTerm}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {t.utterance} #{evolution.transitionUtteranceId}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                      {evolution.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Turning Points */}
      {turningPointsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.turningPoints}</CardTitle>
            <CardDescription>{t.turningPointsDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              
              <div className="space-y-6">
                {turningPointsData.map((tp, index) => (
                  <div key={index} className="relative pl-10">
                    {/* Timeline dot */}
                    <div 
                      className="absolute left-2 w-5 h-5 rounded-full border-2 border-white"
                      style={{ backgroundColor: impactColors[tp.impact] }}
                    />
                    
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            #{tp.utteranceId}
                          </Badge>
                          <span className="font-medium">{tp.speakerId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary"
                            className="text-xs"
                          >
                            {t[tp.type as keyof typeof t]}
                          </Badge>
                          <Badge 
                            className="text-xs text-white"
                            style={{ backgroundColor: impactColors[tp.impact] }}
                          >
                            {t.impact}: {t[tp.impact as keyof typeof t]}
                          </Badge>
                        </div>
                      </div>
                      
                      {tp.utterance && (
                        <p className="text-sm text-foreground mb-2 p-2 bg-muted/50 rounded">
                          {tp.utterance.content.length > 150 
                            ? tp.utterance.content.substring(0, 150) + "..."
                            : tp.utterance.content}
                        </p>
                      )}
                      
                      <p className="text-sm text-muted-foreground">{tp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
