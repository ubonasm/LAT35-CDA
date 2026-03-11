"use client"

import { useMemo, useState, useCallback } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  MarkerType,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { HelpCircle, X, ChevronDown, ChevronUp } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import type { AnalysisResult, Utterance, DiscourseSegment, SegmentRelation, SegmentRelationType } from "@/lib/analysis-types"

interface SegmentViewProps {
  result: AnalysisResult
  utterances: Utterance[]
}

// 分節タイプの色
const segmentTypeColors: Record<DiscourseSegment["segmentType"], string> = {
  opening: "#3b82f6",
  development: "#22c55e",
  climax: "#f59e0b",
  conclusion: "#8b5cf6",
  digression: "#94a3b8",
  transition: "#ec4899",
}

// 分節関係の色
const relationColors: Record<SegmentRelationType, string> = {
  continuation: "#22c55e",
  succession: "#3b82f6",
  topic_shift: "#f59e0b",
  deepening: "#8b5cf6",
  branching: "#ec4899",
  return: "#06b6d4",
  summary: "#84cc16",
}

// カスタムノードコンポーネント
function SegmentNode({ data }: { data: { 
  label: string
  description: string
  segmentType: DiscourseSegment["segmentType"]
  utteranceCount: number
  mainSpeaker: string | null
  isSelected: boolean
  onClick: () => void
} }) {
  const color = segmentTypeColors[data.segmentType]
  
  return (
    <div 
      className={`px-4 py-3 rounded-lg border-2 cursor-pointer transition-all min-w-[180px] max-w-[220px] ${
        data.isSelected ? "ring-2 ring-offset-2 ring-primary" : ""
      }`}
      style={{ 
        backgroundColor: `${color}15`,
        borderColor: color,
      }}
      onClick={data.onClick}
    >
      <Handle type="target" position={Position.Left} className="!bg-muted-foreground" />
      <Handle type="source" position={Position.Right} className="!bg-muted-foreground" />
      
      <div className="font-semibold text-sm text-foreground mb-1 truncate">
        {data.label}
      </div>
      <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
        {data.description}
      </div>
      <div className="flex items-center justify-between text-xs">
        <Badge 
          variant="secondary" 
          className="text-[10px] px-1.5 py-0"
          style={{ backgroundColor: `${color}30`, color }}
        >
          {data.segmentType}
        </Badge>
        <span className="text-muted-foreground">{data.utteranceCount}発言</span>
      </div>
      {data.mainSpeaker && (
        <div className="text-xs text-muted-foreground mt-1">
          主: {data.mainSpeaker}
        </div>
      )}
    </div>
  )
}

const nodeTypes = {
  segment: SegmentNode,
}

export function SegmentView({ result, utterances }: SegmentViewProps) {
  const { language } = useLanguage()
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [expandedSegments, setExpandedSegments] = useState<Set<number>>(new Set())
  
  const t = language === "ja" ? {
    title: "分節構造分析",
    description: "授業を意味のあるまとまり（分節）に分け、その関係を可視化",
    help: "ヘルプ",
    helpTitle: "分節構造図の見方",
    helpClose: "閉じる",
    helpBlock: "ブロック（分節）",
    helpBlockDesc: "連続した発言のまとまりを表します。クリックすると含まれる発言を確認できます。",
    helpColor: "色の意味",
    helpColorOpening: "導入: 授業の開始部分",
    helpColorDevelopment: "展開: 本題の議論部分",
    helpColorClimax: "山場: 議論が最も活発な部分",
    helpColorConclusion: "まとめ: 結論・振り返り部分",
    helpColorDigression: "脱線: 本題から外れた部分",
    helpColorTransition: "転換: 話題が変わる部分",
    helpEdge: "エッジ（線）",
    helpEdgeDesc: "分節間の関係を示します。",
    helpEdgeTypes: "関係タイプ",
    continuation: "継続",
    succession: "引継ぎ",
    topic_shift: "話題転換",
    deepening: "深化",
    branching: "分岐",
    return: "回帰",
    summary: "まとめ",
    segmentList: "分節一覧",
    utterancesInSegment: "この分節に含まれる発言",
    noSegments: "分節データがありません",
    expandAll: "すべて展開",
    collapseAll: "すべて折りたたむ",
  } : {
    title: "Discourse Segment Analysis",
    description: "Divide the lesson into meaningful segments and visualize their relationships",
    help: "Help",
    helpTitle: "How to Read the Segment Structure",
    helpClose: "Close",
    helpBlock: "Blocks (Segments)",
    helpBlockDesc: "Represent groups of consecutive utterances. Click to see included utterances.",
    helpColor: "Color Meaning",
    helpColorOpening: "Opening: Start of the lesson",
    helpColorDevelopment: "Development: Main discussion",
    helpColorClimax: "Climax: Most active discussion",
    helpColorConclusion: "Conclusion: Summary and reflection",
    helpColorDigression: "Digression: Off-topic parts",
    helpColorTransition: "Transition: Topic change parts",
    helpEdge: "Edges (Lines)",
    helpEdgeDesc: "Show relationships between segments.",
    helpEdgeTypes: "Relation Types",
    continuation: "Continuation",
    succession: "Succession",
    topic_shift: "Topic Shift",
    deepening: "Deepening",
    branching: "Branching",
    return: "Return",
    summary: "Summary",
    segmentList: "Segment List",
    utterancesInSegment: "Utterances in this segment",
    noSegments: "No segment data available",
    expandAll: "Expand All",
    collapseAll: "Collapse All",
  }

  const segments = result.discourseSegments || []
  const segmentRelations = result.segmentRelations || []

  // Create initial nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    if (segments.length === 0) {
      return { initialNodes: [], initialEdges: [] }
    }

    // Calculate staggered Y positions to prevent edge overlap
    // Use a zigzag pattern: odd indices go up, even go down
    const getYPosition = (index: number, totalCount: number) => {
      // Create multiple rows with staggered positions
      const row = index % 3
      const baseY = 150
      const yOffsets = [0, -80, 80] // Center, top, bottom
      return baseY + yOffsets[row]
    }

    // ノードを作成（横方向に時系列で配置、Y軸をずらす）
    const initialNodes: Node[] = segments.map((segment, index) => {
      const utteranceCount = segment.endUtteranceId - segment.startUtteranceId + 1
      
      return {
        id: `segment-${segment.id}`,
        type: "segment",
        position: { 
          x: index * 300, 
          y: getYPosition(index, segments.length)
        },
        draggable: true,
        data: {
          label: segment.label,
          description: segment.description,
          segmentType: segment.segmentType,
          utteranceCount,
          mainSpeaker: segment.mainSpeaker,
          isSelected: selectedSegment === segment.id,
          onClick: () => setSelectedSegment(selectedSegment === segment.id ? null : segment.id),
        },
      }
    })

    // エッジを作成（bezierカーブを使用してノードの上を通らないように）
    const initialEdges: Edge[] = segmentRelations.map((relation, index) => {
      // Calculate if edge goes forward or backward
      const fromIndex = segments.findIndex(s => s.id === relation.fromSegmentId)
      const toIndex = segments.findIndex(s => s.id === relation.toSegmentId)
      const isBackward = fromIndex > toIndex
      
      return {
        id: `edge-${index}`,
        source: `segment-${relation.fromSegmentId}`,
        target: `segment-${relation.toSegmentId}`,
        type: "smoothstep",
        animated: relation.relationType === "continuation",
        pathOptions: {
          offset: isBackward ? 50 : 0, // Offset backward edges
        },
        style: { 
          stroke: relationColors[relation.relationType],
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: relationColors[relation.relationType],
        },
        label: language === "ja" ? t[relation.relationType as keyof typeof t] || relation.relationType : relation.relationType,
        labelStyle: { 
          fill: relationColors[relation.relationType],
          fontSize: 12,
          fontWeight: 600,
        },
        labelBgStyle: { 
          fill: "white",
          fillOpacity: 0.95,
        },
        labelBgPadding: [6, 4] as [number, number],
        labelBgBorderRadius: 4,
      }
    })

    return { initialNodes, initialEdges }
  }, [segments, segmentRelations, selectedSegment, language, t])
  
  // Use React Flow's state hooks for draggable nodes
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  
  // Update nodes when selection changes
  useMemo(() => {
    setNodes(nds => 
      nds.map(node => {
        const segmentId = parseInt(node.id.replace("segment-", ""))
        return {
          ...node,
          data: {
            ...node.data,
            isSelected: selectedSegment === segmentId,
            onClick: () => setSelectedSegment(selectedSegment === segmentId ? null : segmentId),
          }
        }
      })
    )
  }, [selectedSegment, setNodes])

  const selectedSegmentData = useMemo(() => {
    if (selectedSegment === null) return null
    return segments.find(s => s.id === selectedSegment)
  }, [selectedSegment, segments])

  const selectedUtterances = useMemo(() => {
    if (!selectedSegmentData) return []
    return utterances.filter(
      u => u.id >= selectedSegmentData.startUtteranceId && u.id <= selectedSegmentData.endUtteranceId
    )
  }, [selectedSegmentData, utterances])

  const toggleSegmentExpand = (segmentId: number) => {
    setExpandedSegments(prev => {
      const next = new Set(prev)
      if (next.has(segmentId)) {
        next.delete(segmentId)
      } else {
        next.add(segmentId)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedSegments(new Set(segments.map(s => s.id)))
  }

  const collapseAll = () => {
    setExpandedSegments(new Set())
  }

  if (segments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.noSegments}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 分節構造図 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t.title}</CardTitle>
              <CardDescription>{t.description}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              {t.help}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* ヘルプパネル */}
          {showHelp && (
            <div className="mb-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">{t.helpTitle}</h4>
                <Button variant="ghost" size="sm" onClick={() => setShowHelp(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium mb-2">{t.helpBlock}</h5>
                  <p className="text-muted-foreground mb-3">{t.helpBlockDesc}</p>
                  <h5 className="font-medium mb-2">{t.helpColor}</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded" style={{ backgroundColor: segmentTypeColors.opening }}></span>
                      {t.helpColorOpening}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded" style={{ backgroundColor: segmentTypeColors.development }}></span>
                      {t.helpColorDevelopment}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded" style={{ backgroundColor: segmentTypeColors.climax }}></span>
                      {t.helpColorClimax}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded" style={{ backgroundColor: segmentTypeColors.conclusion }}></span>
                      {t.helpColorConclusion}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded" style={{ backgroundColor: segmentTypeColors.digression }}></span>
                      {t.helpColorDigression}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded" style={{ backgroundColor: segmentTypeColors.transition }}></span>
                      {t.helpColorTransition}
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">{t.helpEdge}</h5>
                  <p className="text-muted-foreground mb-3">{t.helpEdgeDesc}</p>
                  <h5 className="font-medium mb-2">{t.helpEdgeTypes}</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-0.5" style={{ backgroundColor: relationColors.continuation }}></span>
                      {t.continuation}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-0.5" style={{ backgroundColor: relationColors.succession }}></span>
                      {t.succession}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-0.5" style={{ backgroundColor: relationColors.topic_shift }}></span>
                      {t.topic_shift}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-0.5" style={{ backgroundColor: relationColors.deepening }}></span>
                      {t.deepening}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-0.5" style={{ backgroundColor: relationColors.branching }}></span>
                      {t.branching}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-0.5" style={{ backgroundColor: relationColors.return }}></span>
                      {t.return}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-6 h-0.5" style={{ backgroundColor: relationColors.summary }}></span>
                      {t.summary}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* React Flow グラフ */}
          <div className="h-[400px] border rounded-lg overflow-hidden bg-background">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              minZoom={0.2}
              maxZoom={2}
              nodesDraggable={true}
              nodesConnectable={false}
              elementsSelectable={true}
            >
              <Background color="#e5e7eb" gap={16} />
              <Controls />
            </ReactFlow>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {language === "ja" 
              ? "ノードはドラッグして移動できます。スクロールでズーム、ドラッグで全体を移動できます。" 
              : "Drag nodes to move them. Scroll to zoom, drag background to pan."}
          </p>

          {/* 選択された分節の詳細 */}
          {selectedSegmentData && (
            <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge style={{ backgroundColor: segmentTypeColors[selectedSegmentData.segmentType] }}>
                  {selectedSegmentData.segmentType}
                </Badge>
                {selectedSegmentData.label}
              </h4>
              <p className="text-sm text-muted-foreground mb-3">{selectedSegmentData.description}</p>
              <h5 className="font-medium text-sm mb-2">{t.utterancesInSegment}</h5>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {selectedUtterances.map(u => (
                    <div 
                      key={u.id} 
                      className="p-2 bg-background rounded border text-sm"
                    >
                      <span className="font-mono text-xs text-muted-foreground mr-2">[{u.id}]</span>
                      <span className={`font-medium ${u.speakerType === "teacher" ? "text-primary" : "text-accent"}`}>
                        {u.speaker}:
                      </span>
                      <span className="ml-2">{u.content}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分節一覧 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t.segmentList}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={expandAll}>
                {t.expandAll}
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                {t.collapseAll}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {segments.map(segment => {
              const isExpanded = expandedSegments.has(segment.id)
              const segmentUtterances = utterances.filter(
                u => u.id >= segment.startUtteranceId && u.id <= segment.endUtteranceId
              )
              const color = segmentTypeColors[segment.segmentType]
              
              return (
                <div 
                  key={segment.id} 
                  className="border rounded-lg overflow-hidden"
                  style={{ borderLeftColor: color, borderLeftWidth: 4 }}
                >
                  <button
                    className="w-full p-3 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                    onClick={() => toggleSegmentExpand(segment.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="secondary"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        {segment.segmentType}
                      </Badge>
                      <div>
                        <div className="font-medium">{segment.label}</div>
                        <div className="text-xs text-muted-foreground">
                          発言 {segment.startUtteranceId} - {segment.endUtteranceId} ({segmentUtterances.length}件)
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t bg-muted/20">
                      <p className="text-sm text-muted-foreground py-2">{segment.description}</p>
                      <div className="space-y-1">
                        {segmentUtterances.map(u => (
                          <div 
                            key={u.id} 
                            className="p-2 bg-background rounded text-sm flex gap-2"
                          >
                            <span className="font-mono text-xs text-muted-foreground shrink-0">[{u.id}]</span>
                            <span className={`font-medium shrink-0 ${u.speakerType === "teacher" ? "text-primary" : "text-accent"}`}>
                              {u.speaker}:
                            </span>
                            <span className="text-foreground">{u.content}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
