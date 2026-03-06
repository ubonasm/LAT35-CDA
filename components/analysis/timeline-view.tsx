"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronUp, User, GraduationCap } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import type { AnalysisResult } from "@/lib/analysis-types"
import { prepareTimelineData } from "@/lib/analysis-utils"

interface TimelineViewProps {
  result: AnalysisResult
}

export function TimelineView({ result }: TimelineViewProps) {
  const { language } = useLanguage()
  
  const content = {
    ja: {
      title: "授業タイムライン",
      description: "発言の時系列表示とコーディング",
      expandAll: "すべて展開",
      collapseAll: "すべて折りたたむ",
      topic: "トピック",
      speaker: "発言者",
      all: "すべて",
      topicShift: "話題転換",
      main: "メイン",
      codes: "コード",
      engagement: "関与度",
      sentiment: "感情",
      cognitive: "認知的",
      social: "社会的",
      procedural: "手続き的",
      metacognitive: "メタ認知的",
    },
    en: {
      title: "Classroom Timeline",
      description: "Chronological display with coding",
      expandAll: "Expand All",
      collapseAll: "Collapse All",
      topic: "Topic",
      speaker: "Speaker",
      all: "All",
      topicShift: "Topic Shift",
      main: "Main",
      codes: "Codes",
      engagement: "Engagement",
      sentiment: "Sentiment",
      cognitive: "Cognitive",
      social: "Social",
      procedural: "Procedural",
      metacognitive: "Metacognitive",
    }
  }
  
  const t = content[language]

  const CODE_COLORS: Record<string, string> = {
    cognitive: "bg-blue-100 text-blue-700 border-blue-200",
    social: "bg-green-100 text-green-700 border-green-200",
    procedural: "bg-amber-100 text-amber-700 border-amber-200",
    metacognitive: "bg-purple-100 text-purple-700 border-purple-200",
  }

  const CODE_LABELS: Record<string, string> = {
    cognitive: t.cognitive,
    social: t.social,
    procedural: t.procedural,
    metacognitive: t.metacognitive,
  }

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [topicFilter, setTopicFilter] = useState<string | null>(null)
  const [speakerFilter, setSpeakerFilter] = useState<string | null>(null)

  const timelineData = useMemo(() => prepareTimelineData(result), [result])
  
  const topics = useMemo(() => {
    const uniqueTopics = new Set(timelineData.map((d) => d.topicName))
    return Array.from(uniqueTopics)
  }, [timelineData])

  const speakers = useMemo(() => {
    const uniqueSpeakers = new Set(timelineData.map((d) => d.speaker))
    return Array.from(uniqueSpeakers)
  }, [timelineData])

  const filteredData = useMemo(() => {
    return timelineData.filter((d) => {
      if (topicFilter && d.topicName !== topicFilter) return false
      if (speakerFilter && d.speaker !== speakerFilter) return false
      return true
    })
  }, [timelineData, topicFilter, speakerFilter])

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const expandAll = () => {
    setExpandedIds(new Set(filteredData.map((d) => d.id)))
  }

  const collapseAll = () => {
    setExpandedIds(new Set())
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">{t.title}</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              {t.description}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll} className="text-xs">
              <ChevronDown className="w-3 h-3 mr-1" />
              {t.expandAll}
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll} className="text-xs">
              <ChevronUp className="w-3 h-3 mr-1" />
              {t.collapseAll}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">{t.topic}:</span>
            <Badge
              variant={topicFilter === null ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setTopicFilter(null)}
            >
              {t.all}
            </Badge>
            {topics.slice(0, 5).map((topic) => (
              <Badge
                key={topic}
                variant={topicFilter === topic ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setTopicFilter(topicFilter === topic ? null : topic)}
              >
                {topic.length > 12 ? topic.substring(0, 12) + "..." : topic}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">{t.speaker}:</span>
            <Badge
              variant={speakerFilter === null ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setSpeakerFilter(null)}
            >
              {t.all}
            </Badge>
            {speakers.map((speaker) => (
              <Badge
                key={speaker}
                variant={speakerFilter === speaker ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setSpeakerFilter(speakerFilter === speaker ? null : speaker)}
              >
                {speaker}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
            
            <div className="space-y-3">
              {filteredData.map((item, index) => {
                const isExpanded = expandedIds.has(item.id)
                const prevTopic = index > 0 ? filteredData[index - 1].topicName : null
                const showTopicChange = prevTopic && prevTopic !== item.topicName

                return (
                  <div key={item.id}>
                    {showTopicChange && (
                      <div className="flex items-center gap-2 py-2 ml-10">
                        <div className="h-px flex-1 bg-primary/30" />
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          {t.topicShift}: {item.topicName}
                        </Badge>
                        <div className="h-px flex-1 bg-primary/30" />
                      </div>
                    )}
                    
                    <div className="relative flex gap-3">
                      {/* Timeline dot */}
                      <div className={`
                        relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0
                        ${item.speakerType === "teacher" 
                          ? "bg-primary/10 border-2 border-primary" 
                          : "bg-accent/10 border-2 border-accent"
                        }
                      `}>
                        {item.speakerType === "teacher" ? (
                          <GraduationCap className="w-5 h-5 text-primary" />
                        ) : (
                          <User className="w-5 h-5 text-accent" />
                        )}
                      </div>

                      {/* Content card */}
                      <div 
                        className={`
                          flex-1 rounded-lg border bg-card p-3 transition-all cursor-pointer
                          ${isExpanded ? "border-primary/50 shadow-sm" : "border-border/60 hover:border-primary/30"}
                        `}
                        onClick={() => toggleExpand(item.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">
                              #{item.id}
                            </span>
                            <span className={`font-medium text-sm ${
                              item.speakerType === "teacher" ? "text-primary" : "text-accent"
                            }`}>
                              {item.speaker}
                            </span>
                            {item.isMainstream && (
                              <Badge variant="outline" className="text-[10px] h-4 border-primary/50 text-primary">
                                {t.main}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {/* Sentiment indicator */}
                            <div 
                              className={`w-2 h-2 rounded-full ${
                                item.sentiment > 0.2 ? "bg-green-400" :
                                item.sentiment < -0.2 ? "bg-red-400" :
                                "bg-gray-300"
                              }`}
                              title={`${t.sentiment}: ${(item.sentiment * 100).toFixed(0)}%`}
                            />
                            <span className="text-xs text-muted-foreground">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </span>
                          </div>
                        </div>

                        <p className={`text-sm text-foreground/90 mt-1.5 ${isExpanded ? "" : "line-clamp-2"}`}>
                          {item.content}
                        </p>

                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-border/60 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground">{t.topic}:</span>
                              <Badge variant="secondary" className="text-xs">
                                {item.topicName}
                              </Badge>
                            </div>
                            
                            {item.codes.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-muted-foreground">{t.codes}:</span>
                                {item.codes.map((code, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className={`text-xs ${CODE_COLORS[code.category] || ""}`}
                                  >
                                    {CODE_LABELS[code.category]}: {code.code}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{t.engagement}: {(item.engagement * 100).toFixed(0)}%</span>
                              <span>{t.sentiment}: {item.sentiment > 0 ? "+" : ""}{(item.sentiment * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
