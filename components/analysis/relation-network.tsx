"use client"

import { useMemo, useState, useEffect } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Maximize2, Info } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import type { AnalysisResult } from "@/lib/analysis-types"

interface RelationNetworkProps {
  result: AnalysisResult
}

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

function TeacherNode({ data }: { data: { label: string; content: string; fullContent: string } }) {
  const [showFull, setShowFull] = useState(false)
  
  return (
    <div 
      className="px-3 py-2 rounded-lg border-2 shadow-sm bg-white min-w-[100px] max-w-[180px] cursor-pointer transition-all hover:shadow-md"
      style={{ borderColor: "#3b82f6" }}
      onClick={() => setShowFull(!showFull)}
    >
      <div className="font-semibold text-xs" style={{ color: "#3b82f6" }}>{data.label}</div>
      <div className="text-xs mt-1 line-clamp-2" style={{ color: "#334155" }}>
        {showFull ? data.fullContent : data.content}
      </div>
    </div>
  )
}

function StudentNode({ data }: { data: { label: string; content: string; fullContent: string } }) {
  const [showFull, setShowFull] = useState(false)
  
  return (
    <div 
      className="px-3 py-2 rounded-lg border-2 shadow-sm bg-white min-w-[100px] max-w-[180px] cursor-pointer transition-all hover:shadow-md"
      style={{ borderColor: "#22c55e" }}
      onClick={() => setShowFull(!showFull)}
    >
      <div className="font-semibold text-xs" style={{ color: "#22c55e" }}>{data.label}</div>
      <div className="text-xs mt-1 line-clamp-2" style={{ color: "#334155" }}>
        {showFull ? data.fullContent : data.content}
      </div>
    </div>
  )
}

const nodeTypes = {
  teacher: TeacherNode,
  student: StudentNode,
}

function NetworkContent({ result, filter, setFilter, lang }: { 
  result: AnalysisResult
  filter: string | null
  setFilter: (f: string | null) => void
  lang: "ja" | "en"
}) {
  const { fitView, zoomIn, zoomOut } = useReactFlow()

  const content = {
    ja: {
      filterByType: "関係タイプでフィルタ",
      all: "すべて",
      legend: "凡例",
      teacherRow: "教師（上段）",
      studentRow: "児童生徒（下段）",
      xAxis: "横軸: 発言順序（左→右）",
      arrows: "矢印: 発言間の関係性",
      agreement: "同意",
      disagreement: "反対",
      addition: "付け足し",
      paraphrase: "言い換え",
      question: "質問",
      answer: "回答",
      topic_shift: "話題転換",
      elaboration: "詳細化",
    },
    en: {
      filterByType: "Filter by Relation Type",
      all: "All",
      legend: "Legend",
      teacherRow: "Teacher (Top Row)",
      studentRow: "Students (Bottom Row)",
      xAxis: "X-axis: Utterance order (Left→Right)",
      arrows: "Arrows: Relations between utterances",
      agreement: "Agreement",
      disagreement: "Disagreement",
      addition: "Addition",
      paraphrase: "Paraphrase",
      question: "Question",
      answer: "Answer",
      topic_shift: "Topic Shift",
      elaboration: "Elaboration",
    }
  }
  
  const t = content[lang]
  
  const RELATION_LABELS: Record<string, string> = {
    agreement: t.agreement,
    disagreement: t.disagreement,
    addition: t.addition,
    paraphrase: t.paraphrase,
    question: t.question,
    answer: t.answer,
    topic_shift: t.topic_shift,
    elaboration: t.elaboration,
  }

  const { initialNodes, initialEdges } = useMemo(() => {
    const horizontalSpacing = 200
    const verticalSpacing = 100
    
    const nodes: Node[] = result.utterances.map((u, i) => {
      const isTeacher = u.speakerType === "teacher"
      
      return {
        id: u.id.toString(),
        type: isTeacher ? "teacher" : "student",
        position: { 
          x: i * horizontalSpacing, 
          y: isTeacher ? 0 : verticalSpacing
        },
        data: {
          label: `${u.id}. ${u.speaker}`,
          content: u.content.substring(0, 30) + (u.content.length > 30 ? "..." : ""),
          fullContent: u.content,
          speaker: u.speaker,
          speakerType: u.speakerType,
        },
      }
    })

    const edges: Edge[] = result.relations.map((r, i) => ({
      id: `e${i}`,
      source: r.fromId.toString(),
      target: r.toId.toString(),
      type: "smoothstep",
      animated: r.type === "topic_shift",
      style: {
        strokeWidth: Math.max(1.5, r.strength * 2.5),
        stroke: RELATION_COLORS[r.type] || "#94a3b8",
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: RELATION_COLORS[r.type] || "#94a3b8",
        width: 15,
        height: 15,
      },
      label: RELATION_LABELS[r.type],
      labelStyle: { 
        fontSize: 9, 
        fill: "#64748b",
        fontWeight: 500,
      },
      labelBgStyle: {
        fill: "#ffffff",
        fillOpacity: 0.9,
      },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 4,
      data: {
        type: r.type,
        strength: r.strength,
        description: r.description,
      },
    }))

    return { initialNodes: nodes, initialEdges: edges }
  }, [result, RELATION_LABELS])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setTimeout(() => {
      fitView({ padding: 0.2 })
    }, 100)
  }, [fitView])

  const filteredEdges = useMemo(() => {
    if (!filter) return edges
    return edges.filter((e) => e.data?.type === filter)
  }, [edges, filter])

  const relationCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    result.relations.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1
    })
    return counts
  }, [result.relations])

  return (
    <ReactFlow
      nodes={nodes}
      edges={filteredEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.1}
      maxZoom={2}
      attributionPosition="bottom-left"
      className="bg-slate-50"
      defaultEdgeOptions={{
        type: "smoothstep",
      }}
    >
      <Background color="#cbd5e1" gap={20} size={1} />
      
      <MiniMap 
        nodeColor={(node) => node.type === "teacher" ? "#3b82f6" : "#22c55e"}
        className="bg-white border border-slate-200 shadow-sm rounded-lg"
        maskColor="rgba(0,0,0,0.1)"
        pannable
        zoomable
        position="bottom-left"
        style={{ marginBottom: 10, marginLeft: 10 }}
      />
      
      <Panel position="top-left" className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {t.filterByType}
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => zoomIn()}>
                <ZoomIn className="w-3 h-3" />
              </Button>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => zoomOut()}>
                <ZoomOut className="w-3 h-3" />
              </Button>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => fitView({ padding: 0.2 })}>
                <Maximize2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 max-w-[280px]">
            <Badge
              variant={filter === null ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setFilter(null)}
            >
              {t.all}
            </Badge>
            {Object.entries(RELATION_LABELS).map(([key, label]) => (
              <Badge
                key={key}
                variant={filter === key ? "default" : "outline"}
                className="cursor-pointer text-xs transition-colors"
                style={{
                  backgroundColor: filter === key ? RELATION_COLORS[key] : "transparent",
                  borderColor: RELATION_COLORS[key],
                  color: filter === key ? "white" : RELATION_COLORS[key],
                }}
                onClick={() => setFilter(filter === key ? null : key)}
              >
                {label} ({relationCounts[key] || 0})
              </Badge>
            ))}
          </div>
        </div>
      </Panel>
      
      <Panel position="top-right" className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm max-w-[200px]">
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t.legend}</p>
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 flex-shrink-0" style={{ borderColor: "#3b82f6", backgroundColor: "#eff6ff" }} />
              <span className="text-slate-700">{t.teacherRow}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 flex-shrink-0" style={{ borderColor: "#22c55e", backgroundColor: "#f0fdf4" }} />
              <span className="text-slate-700">{t.studentRow}</span>
            </div>
            <div className="border-t border-slate-200 pt-1.5 mt-1">
              <p className="text-slate-500 text-[10px]">{t.xAxis}</p>
              <p className="text-slate-500 text-[10px]">{t.arrows}</p>
            </div>
          </div>
        </div>
      </Panel>
    </ReactFlow>
  )
}

export function RelationNetwork({ result }: RelationNetworkProps) {
  const { language } = useLanguage()
  const [filter, setFilter] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  
  const content = {
    ja: {
      title: "授業構造ネットワーク図",
      description: "発言間の関係性を可視化。ノードをクリックで詳細表示、ドラッグで移動可能",
      utterances: "発言",
      relations: "関係",
      howToRead: "このネットワーク図の見方",
      topRow: "上段（青）: 教師の発言を時系列で配置",
      bottomRow: "下段（緑）: 児童生徒の発言を時系列で配置",
      arrowMeaning: "矢印: 発言Aから発言Bへの矢印は「AがBに影響を与えた」ことを示します",
      colorMeaning: "矢印の色は関係タイプを示します（同意=緑、反対=赤、質問=黄など）",
      clickNode: "ノードをクリックすると発言内容の全文が表示されます",
    },
    en: {
      title: "Classroom Structure Network",
      description: "Visualize relationships between utterances. Click nodes to see details, drag to move",
      utterances: "utterances",
      relations: "relations",
      howToRead: "How to read this network diagram",
      topRow: "Top row (blue): Teacher utterances in chronological order",
      bottomRow: "Bottom row (green): Student utterances in chronological order",
      arrowMeaning: "Arrows: An arrow from A to B indicates 'A influenced B'",
      colorMeaning: "Arrow colors indicate relation types (agreement=green, disagreement=red, question=yellow, etc.)",
      clickNode: "Click a node to see the full utterance content",
    }
  }
  
  const t = content[language]

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">{t.title}</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              {t.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {result.utterances.length} {t.utterances} / {result.relations.length} {t.relations}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setShowHelp(!showHelp)}
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {showHelp && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">{t.howToRead}</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>{language === "ja" ? "上段（青）" : "Top (blue)"}</strong>: {language === "ja" ? "教師の発言を時系列で配置" : "Teacher utterances in chronological order"}</li>
              <li><strong>{language === "ja" ? "下段（緑）" : "Bottom (green)"}</strong>: {language === "ja" ? "児童生徒の発言を時系列で配置" : "Student utterances in chronological order"}</li>
              <li><strong>{language === "ja" ? "矢印" : "Arrows"}</strong>: {t.arrowMeaning}</li>
              <li>{t.colorMeaning}</li>
              <li>{t.clickNode}</li>
            </ul>
          </div>
        )}
      </CardHeader>
      <CardContent className="h-[550px] p-0">
        <ReactFlowProvider>
          <NetworkContent result={result} filter={filter} setFilter={setFilter} lang={language} />
        </ReactFlowProvider>
      </CardContent>
    </Card>
  )
}
