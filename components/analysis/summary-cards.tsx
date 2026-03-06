"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Lightbulb, 
  Star,
  AlertTriangle,
  CheckCircle2,
  Target
} from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import type { AnalysisResult } from "@/lib/analysis-types"

interface SummaryCardsProps {
  result: AnalysisResult
}

export function SummaryCards({ result }: SummaryCardsProps) {
  const { language } = useLanguage()
  
  const content = {
    ja: {
      analysisSummary: "分析サマリー",
      totalUtterances: "総発言数",
      participants: "参加者数",
      students: "児童生徒",
      discussionQuality: "議論の質",
      studentParticipation: "生徒参加度",
      teacherRatio: "教師発言率",
      studentRatio: "児童生徒発言率",
      times: "回",
      keyFindings: "主な発見",
      hiddenInfluencers: "隠れた影響者",
      hiddenInfluencersDesc: "発言量は少ないが、議論の方向性に大きな影響を与えた発言者",
      influenceScore: "影響度スコア",
      topicStructure: "トピック構造",
      topicStructureDesc: "授業で扱われた話題の階層構造",
      mainstream: "メインストリーム",
      utterance: "発言",
      utterances: "発言",
      teacherInterventionPoints: "教師介入ポイント",
      teacherInterventionPointsDesc: "議論の転換点となった教師の発言",
      redirect: "方向転換",
      scaffold: "足場かけ",
      clarify: "明確化",
      validate: "承認",
      challenge: "挑戦",
      summarize: "要約",
    },
    en: {
      analysisSummary: "Analysis Summary",
      totalUtterances: "Total Utterances",
      participants: "Participants",
      students: "Students",
      discussionQuality: "Discussion Quality",
      studentParticipation: "Student Participation",
      teacherRatio: "Teacher Ratio",
      studentRatio: "Student Ratio",
      times: "times",
      keyFindings: "Key Findings",
      hiddenInfluencers: "Hidden Influencers",
      hiddenInfluencersDesc: "Speakers who significantly influenced discussion despite fewer utterances",
      influenceScore: "Influence Score",
      topicStructure: "Topic Structure",
      topicStructureDesc: "Hierarchical structure of topics discussed in class",
      mainstream: "Mainstream",
      utterance: "Utterance",
      utterances: "utterances",
      teacherInterventionPoints: "Teacher Intervention Points",
      teacherInterventionPointsDesc: "Teacher utterances that became turning points in discussion",
      redirect: "Redirect",
      scaffold: "Scaffold",
      clarify: "Clarify",
      validate: "Validate",
      challenge: "Challenge",
      summarize: "Summarize",
    }
  }
  
  const t = content[language]
  
  const totalUtterances = result.utterances.length
  const teacherUtterances = result.utterances.filter(u => u.speakerType === "teacher").length
  const studentUtterances = totalUtterances - teacherUtterances
  const teacherRatio = (teacherUtterances / totalUtterances) * 100

  const uniqueSpeakers = new Set(result.utterances.map(u => u.speaker)).size
  const studentSpeakers = new Set(result.utterances.filter(u => u.speakerType === "student").map(u => u.speaker)).size

  return (
    <div className="space-y-4">
      {/* Main Summary */}
      <Card className="border-border/60 bg-gradient-to-br from-card to-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-foreground">{t.analysisSummary}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {result.summary.mainTheme}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-card rounded-lg border border-border/60">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs">{t.totalUtterances}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalUtterances}</p>
            </div>
            
            <div className="p-3 bg-card rounded-lg border border-border/60">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs">{t.participants}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{uniqueSpeakers}</p>
              <p className="text-xs text-muted-foreground">{t.students}: {studentSpeakers}</p>
            </div>
            
            <div className="p-3 bg-card rounded-lg border border-border/60">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">{t.discussionQuality}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {(result.summary.discussionQuality * 100).toFixed(0)}%
              </p>
              <Progress 
                value={result.summary.discussionQuality * 100} 
                className="h-1.5 mt-1"
              />
            </div>
            
            <div className="p-3 bg-card rounded-lg border border-border/60">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs">{t.studentParticipation}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {(result.summary.studentParticipation * 100).toFixed(0)}%
              </p>
              <Progress 
                value={result.summary.studentParticipation * 100} 
                className="h-1.5 mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
            <div className="text-sm">
              <span className="text-muted-foreground">{t.teacherRatio}:</span>
              <span className="ml-2 font-medium text-foreground">{teacherRatio.toFixed(1)}%</span>
              <span className="text-muted-foreground ml-2">({teacherUtterances}{t.times})</span>
            </div>
            <div className="flex-1" />
            <div className="text-sm">
              <span className="text-muted-foreground">{t.studentRatio}:</span>
              <span className="ml-2 font-medium text-foreground">{(100 - teacherRatio).toFixed(1)}%</span>
              <span className="text-muted-foreground ml-2">({studentUtterances}{t.times})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            {t.keyFindings}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {result.summary.keyInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Hidden Influencers */}
      {result.hiddenInfluencers.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              {t.hiddenInfluencers}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              {t.hiddenInfluencersDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.hiddenInfluencers.map((influencer, i) => (
                <div 
                  key={i} 
                  className="p-3 bg-muted/30 rounded-lg border border-border/40"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-medium">
                        {influencer.speakerId}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {t.influenceScore}: {(influencer.influenceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {influencer.keyUtteranceIds.slice(0, 3).map((id) => (
                        <Badge 
                          key={id} 
                          variant="secondary" 
                          className="text-xs"
                        >
                          #{id}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80">{influencer.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topics Overview */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">{t.topicStructure}</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {t.topicStructureDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {result.topics.map((topic) => (
              <div 
                key={topic.id}
                className={`
                  p-3 rounded-lg border transition-colors
                  ${topic.isMainstream 
                    ? "bg-primary/5 border-primary/30" 
                    : topic.parentTopicId 
                      ? "bg-muted/20 border-border/40 ml-6" 
                      : "bg-muted/30 border-border/60"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground">{topic.name}</span>
                    {topic.isMainstream && (
                      <Badge className="text-xs bg-primary/10 text-primary border-primary/30">
                        {t.mainstream}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{t.utterance} #{topic.startId} - #{topic.endId}</span>
                    <span>{topic.utteranceIds.length} {t.utterances}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teacher Interventions Summary */}
      {result.quantitativeMetrics.teacherInterventions.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {t.teacherInterventionPoints}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              {t.teacherInterventionPointsDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {result.quantitativeMetrics.teacherInterventions
                .filter(i => i.impact === "high")
                .slice(0, 5)
                .map((intervention, i) => {
                  const utterance = result.utterances.find(u => u.id === intervention.utteranceId)
                  const typeLabel = 
                    intervention.type === "redirect" ? t.redirect :
                    intervention.type === "scaffold" ? t.scaffold :
                    intervention.type === "clarify" ? t.clarify :
                    intervention.type === "validate" ? t.validate :
                    intervention.type === "challenge" ? t.challenge :
                    t.summarize
                  return (
                    <div 
                      key={i}
                      className="p-2 bg-muted/20 rounded-lg border border-border/40"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          #{intervention.utteranceId}
                        </Badge>
                        <Badge 
                          className={`text-xs ${
                            intervention.type === "redirect" ? "bg-amber-100 text-amber-700" :
                            intervention.type === "scaffold" ? "bg-blue-100 text-blue-700" :
                            intervention.type === "clarify" ? "bg-green-100 text-green-700" :
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {typeLabel}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground/80 line-clamp-2">
                        {utterance?.content}
                      </p>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
