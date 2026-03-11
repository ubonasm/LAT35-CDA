"use client"

import { useMemo, useState, useCallback } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/lib/language-context"
import type { AnalysisResult, Utterance } from "@/lib/analysis-types"

interface ThemeNetworkProps {
  result: AnalysisResult
  utterances: Utterance[]
}

// Custom node for utterance
function UtteranceNode({ data }: { data: any }) {
  const bgColor = data.speakerType === "teacher" 
    ? "bg-blue-100 border-blue-400" 
    : "bg-green-100 border-green-400"
  
  return (
    <div 
      className={`px-3 py-2 rounded-lg border-2 shadow-md cursor-pointer transition-all max-w-[200px] ${bgColor} ${data.isSelected ? "ring-2 ring-primary ring-offset-2" : ""}`}
      onClick={data.onClick}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="text-xs font-bold text-gray-700 mb-1">
        [{data.id}] {data.speaker}
      </div>
      <div className="text-xs text-gray-600 line-clamp-3">
        {data.content}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  )
}

const nodeTypes = {
  utterance: UtteranceNode,
}

export function ThemeNetwork({ result, utterances }: ThemeNetworkProps) {
  const { language } = useLanguage()
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [selectedUtterance, setSelectedUtterance] = useState<number | null>(null)

  const t = {
    ja: {
      title: "テーマ別発言ネットワーク",
      description: "テーマを選択すると、関連する発言と話者のネットワークを表示します",
      selectTheme: "テーマを選択",
      noThemes: "テーマが検出されませんでした",
      utterances: "発言",
      distance: "距離",
      teacher: "教師",
      student: "生徒",
      mainstream: "メインストリーム",
      subtopic: "サブトピック",
      relatedUtterances: "関連発言",
      dragHint: "ノードはドラッグして移動できます。エッジの数値は発言間の意味的距離（0が最も近い）を示します。",
    },
    en: {
      title: "Theme-based Utterance Network",
      description: "Select a theme to view the network of related utterances and speakers",
      selectTheme: "Select Theme",
      noThemes: "No themes detected",
      utterances: "utterances",
      distance: "Distance",
      teacher: "Teacher",
      student: "Student",
      mainstream: "Mainstream",
      subtopic: "Subtopic",
      relatedUtterances: "Related Utterances",
      dragHint: "Drag nodes to move them. Edge numbers show semantic distance between utterances (0 is closest).",
    }
  }[language]

  // Get topics from result
  const topics = result.topics || []
  const distances = result.utteranceDistances || []

  // Get utterances for selected theme
  const themeUtterances = useMemo(() => {
    if (!selectedTheme) return []
    const topic = topics.find(t => t.id === selectedTheme)
    if (!topic) return []
    return utterances.filter(u => topic.utteranceIds?.includes(u.id))
  }, [selectedTheme, topics, utterances])

  // Calculate node positions using force-directed-like layout
  const calculatePositions = useCallback((utteranceList: Utterance[]) => {
    if (utteranceList.length === 0) return []
    
    // Group by speaker
    const speakerGroups: Record<string, Utterance[]> = {}
    utteranceList.forEach(u => {
      if (!speakerGroups[u.speaker]) {
        speakerGroups[u.speaker] = []
      }
      speakerGroups[u.speaker].push(u)
    })

    const speakers = Object.keys(speakerGroups)
    const positions: { id: number; x: number; y: number }[] = []
    
    // Arrange speakers in a circle, utterances vertically under each speaker
    const centerX = 400
    const centerY = 300
    const radius = Math.max(200, speakers.length * 50)

    speakers.forEach((speaker, speakerIndex) => {
      const angle = (2 * Math.PI * speakerIndex) / speakers.length - Math.PI / 2
      const speakerX = centerX + radius * Math.cos(angle)
      const speakerY = centerY + radius * Math.sin(angle)

      speakerGroups[speaker].forEach((utterance, utteranceIndex) => {
        positions.push({
          id: utterance.id,
          x: speakerX + (utteranceIndex % 2 === 0 ? -30 : 30),
          y: speakerY + utteranceIndex * 100,
        })
      })
    })

    return positions
  }, [])

  // Create nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    if (themeUtterances.length === 0) {
      return { initialNodes: [], initialEdges: [] }
    }

    const positions = calculatePositions(themeUtterances)
    const positionMap = new Map(positions.map(p => [p.id, { x: p.x, y: p.y }]))

    // Create nodes
    const initialNodes: Node[] = themeUtterances.map(utterance => {
      const pos = positionMap.get(utterance.id) || { x: 0, y: 0 }
      return {
        id: `utterance-${utterance.id}`,
        type: "utterance",
        position: pos,
        draggable: true,
        data: {
          id: utterance.id,
          speaker: utterance.speaker,
          speakerType: utterance.speakerType,
          content: utterance.content.substring(0, 100) + (utterance.content.length > 100 ? "..." : ""),
          isSelected: selectedUtterance === utterance.id,
          onClick: () => setSelectedUtterance(selectedUtterance === utterance.id ? null : utterance.id),
        },
      }
    })

    // Create distance lookup map
    const utteranceIds = themeUtterances.map(u => u.id)
    const utteranceIdSet = new Set(utteranceIds)
    const distanceMap = new Map<string, number>()
    distances.forEach(d => {
      distanceMap.set(`${d.fromId}-${d.toId}`, d.semanticDistance)
      distanceMap.set(`${d.toId}-${d.fromId}`, d.semanticDistance)
    })

    // Create edges for ALL consecutive and related utterance pairs
    const initialEdges: Edge[] = []
    const addedEdges = new Set<string>()

    // Helper function to add an edge (only if both nodes exist)
    const addEdge = (fromId: number, toId: number) => {
      // Ensure both nodes exist in this theme's utterances
      if (!utteranceIdSet.has(fromId) || !utteranceIdSet.has(toId)) return
      
      const edgeKey = `${Math.min(fromId, toId)}-${Math.max(fromId, toId)}`
      if (addedEdges.has(edgeKey)) return
      addedEdges.add(edgeKey)

      // Get distance from Gemini data or calculate default
      let semanticDistance = distanceMap.get(`${fromId}-${toId}`)
      if (semanticDistance === undefined) {
        // Default distance based on utterance ID difference (closer IDs = smaller distance)
        const idDiff = Math.abs(toId - fromId)
        semanticDistance = Math.min(0.9, idDiff * 0.1)
      }

      // Color based on distance (green = close, red = far)
      const hue = 120 - semanticDistance * 120
      const color = `hsl(${hue}, 70%, 45%)`

      initialEdges.push({
        id: `edge-${fromId}-${toId}`,
        source: `utterance-${fromId}`,
        target: `utterance-${toId}`,
        type: "smoothstep",
        animated: semanticDistance < 0.3,
        style: { 
          stroke: color,
          strokeWidth: Math.max(1, 3 - semanticDistance * 3),
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: color,
        },
        label: semanticDistance.toFixed(2),
        labelStyle: { 
          fill: color,
          fontSize: 11,
          fontWeight: 600,
        },
        labelBgStyle: { 
          fill: "white",
          fillOpacity: 0.95,
        },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 3,
      })
    }

    // Add edges for consecutive utterances in the theme
    const sortedIds = [...utteranceIds].sort((a, b) => a - b)
    for (let i = 0; i < sortedIds.length - 1; i++) {
      addEdge(sortedIds[i], sortedIds[i + 1], true)
    }

    // Add edges from relations data
    if (result.relations) {
      result.relations.forEach(relation => {
        addEdge(relation.fromId, relation.toId)
      })
    }

    // Add edges from Gemini distance data
    distances.forEach(d => {
      addEdge(d.fromId, d.toId)
    })

    return { initialNodes, initialEdges }
  }, [themeUtterances, distances, selectedUtterance, calculatePositions, result.relations])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes when theme changes
  useMemo(() => {
    if (initialNodes.length > 0) {
      setNodes(initialNodes)
      setEdges(initialEdges)
    }
  }, [initialNodes, initialEdges, setNodes, setEdges])

  // Get selected utterance details
  const selectedUtteranceData = selectedUtterance 
    ? utterances.find(u => u.id === selectedUtterance)
    : null

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">
            {t.title}
          </CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Theme selector */}
          <div className="flex items-center gap-4">
            <Select value={selectedTheme || ""} onValueChange={setSelectedTheme}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder={t.selectTheme} />
              </SelectTrigger>
              <SelectContent>
                {topics.length === 0 ? (
                  <SelectItem value="none" disabled>{t.noThemes}</SelectItem>
                ) : (
                  topics.map(topic => (
                    <SelectItem key={topic.id} value={topic.id}>
                      <div className="flex items-center gap-2">
                        <span>{topic.name}</span>
                        <Badge variant={topic.isMainstream ? "default" : "secondary"} className="text-xs">
                          {topic.isMainstream ? t.mainstream : t.subtopic}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ({topic.utteranceIds?.length || 0} {t.utterances})
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Network graph */}
          {selectedTheme && themeUtterances.length > 0 ? (
            <>
              <div className="h-[500px] border rounded-lg overflow-hidden bg-background">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  nodeTypes={nodeTypes}
                  fitView
                  fitViewOptions={{ padding: 0.2 }}
                  minZoom={0.2}
                  maxZoom={2}
                  nodesDraggable={true}
                  nodesConnectable={false}
                >
                  <Background color="#e5e7eb" gap={16} />
                  <Controls />
                  <MiniMap 
                    nodeColor={(node) => {
                      return node.data?.speakerType === "teacher" ? "#93c5fd" : "#86efac"
                    }}
                    className="bg-background border rounded"
                  />
                </ReactFlow>
              </div>
              <p className="text-xs text-muted-foreground">{t.dragHint}</p>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-400"></div>
                  <span>{t.teacher}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-400"></div>
                  <span>{t.student}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-green-500"></div>
                  <span>{t.distance}: 0 ({language === "ja" ? "近い" : "close"})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-red-500"></div>
                  <span>{t.distance}: 1 ({language === "ja" ? "遠い" : "far"})</span>
                </div>
              </div>
            </>
          ) : selectedTheme ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground border rounded-lg">
              {language === "ja" ? "このテーマに関連する発言がありません" : "No utterances found for this theme"}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground border rounded-lg">
              {language === "ja" ? "テーマを選択してください" : "Please select a theme"}
            </div>
          )}

          {/* Selected utterance details */}
          {selectedUtteranceData && (
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  [{selectedUtteranceData.id}] {selectedUtteranceData.speaker}
                  <Badge variant={selectedUtteranceData.speakerType === "teacher" ? "default" : "secondary"} className="ml-2">
                    {selectedUtteranceData.speakerType === "teacher" ? t.teacher : t.student}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{selectedUtteranceData.content}</p>
              </CardContent>
            </Card>
          )}

          {/* Utterance list for selected theme */}
          {selectedTheme && themeUtterances.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">{t.relatedUtterances}</h4>
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {themeUtterances.map(utterance => (
                  <div 
                    key={utterance.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedUtterance === utterance.id 
                        ? "bg-primary/10 border-primary" 
                        : "bg-card hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedUtterance(selectedUtterance === utterance.id ? null : utterance.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {utterance.id}
                      </Badge>
                      <span className={`text-sm font-medium ${
                        utterance.speakerType === "teacher" ? "text-blue-600" : "text-green-600"
                      }`}>
                        {utterance.speaker}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {utterance.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
