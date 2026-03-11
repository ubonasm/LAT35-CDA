import type { AnalysisResult, Utterance, UtteranceRelation, Topic } from "./analysis-types"

// Calculate discussion flow metrics
export function calculateDiscussionFlow(utterances: Utterance[], relations: UtteranceRelation[]) {
  const flow: { id: number; speaker: string; speakerType: string; inDegree: number; outDegree: number }[] = []
  
  utterances.forEach(u => {
    const inDegree = relations.filter(r => r.toId === u.id).length
    const outDegree = relations.filter(r => r.fromId === u.id).length
    flow.push({
      id: u.id,
      speaker: u.speaker,
      speakerType: u.speakerType,
      inDegree,
      outDegree
    })
  })
  
  return flow
}

// Calculate topic transition matrix
export function calculateTopicTransitions(topics: Topic[]) {
  const sortedTopics = [...topics].sort((a, b) => a.startId - b.startId)
  const transitions: { from: string; to: string; count: number }[] = []
  
  for (let i = 0; i < sortedTopics.length - 1; i++) {
    const from = sortedTopics[i]
    const to = sortedTopics[i + 1]
    
    const existing = transitions.find(t => t.from === from.name && t.to === to.name)
    if (existing) {
      existing.count++
    } else {
      transitions.push({ from: from.name, to: to.name, count: 1 })
    }
  }
  
  return transitions
}

// Calculate engagement over time
export function calculateEngagementTimeline(result: AnalysisResult) {
  const timeline: { utteranceId: number; speaker: string; engagement: number; sentiment: number }[] = []
  
  result.utterances.forEach(u => {
    const sentiment = result.quantitativeMetrics.sentimentScores.find(s => s.utteranceId === u.id)
    if (sentiment) {
      timeline.push({
        utteranceId: u.id,
        speaker: u.speaker,
        engagement: sentiment.engagement,
        sentiment: sentiment.positive - sentiment.negative
      })
    }
  })
  
  return timeline
}

// Calculate relation type distribution
export function calculateRelationDistribution(relations: UtteranceRelation[]) {
  const distribution: Record<string, number> = {}
  
  relations.forEach(r => {
    distribution[r.type] = (distribution[r.type] || 0) + 1
  })
  
  return Object.entries(distribution).map(([type, count]) => ({
    type,
    count,
    percentage: (count / relations.length) * 100
  }))
}

// Calculate teacher intervention effectiveness
export function calculateTeacherEffectiveness(result: AnalysisResult) {
  const interventions = result.quantitativeMetrics.teacherInterventions
  const engagementBefore: number[] = []
  const engagementAfter: number[] = []
  
  interventions.forEach(intervention => {
    const beforeScores = result.quantitativeMetrics.sentimentScores
      .filter(s => s.utteranceId < intervention.utteranceId && s.utteranceId >= intervention.utteranceId - 3)
    const afterScores = result.quantitativeMetrics.sentimentScores
      .filter(s => s.utteranceId > intervention.utteranceId && s.utteranceId <= intervention.utteranceId + 3)
    
    if (beforeScores.length > 0) {
      engagementBefore.push(beforeScores.reduce((sum, s) => sum + s.engagement, 0) / beforeScores.length)
    }
    if (afterScores.length > 0) {
      engagementAfter.push(afterScores.reduce((sum, s) => sum + s.engagement, 0) / afterScores.length)
    }
  })
  
  const avgBefore = engagementBefore.length > 0 
    ? engagementBefore.reduce((a, b) => a + b, 0) / engagementBefore.length 
    : 0
  const avgAfter = engagementAfter.length > 0 
    ? engagementAfter.reduce((a, b) => a + b, 0) / engagementAfter.length 
    : 0
  
  return {
    interventionCount: interventions.length,
    averageEngagementBefore: avgBefore,
    averageEngagementAfter: avgAfter,
    engagementChange: avgAfter - avgBefore,
    byType: interventions.reduce((acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

// Prepare data for network visualization
export function prepareNetworkData(result: AnalysisResult) {
  const nodes = result.utterances.map(u => ({
    id: u.id.toString(),
    data: { 
      label: `${u.id}. ${u.speaker}`,
      content: u.content.substring(0, 50) + (u.content.length > 50 ? "..." : ""),
      speaker: u.speaker,
      speakerType: u.speakerType,
      fullContent: u.content
    },
    position: { x: 0, y: 0 }, // Will be calculated by layout
    type: u.speakerType === "teacher" ? "teacher" : "student"
  }))
  
  const edges = result.relations.map((r, i) => ({
    id: `e${i}`,
    source: r.fromId.toString(),
    target: r.toId.toString(),
    data: {
      type: r.type,
      strength: r.strength,
      description: r.description
    },
    animated: r.type === "topic_shift",
    style: {
      strokeWidth: Math.max(1, r.strength * 3),
      stroke: getRelationColor(r.type)
    },
    label: getRelationLabel(r.type)
  }))
  
  return { nodes, edges }
}

function getRelationColor(type: string): string {
  const colors: Record<string, string> = {
    agreement: "#22c55e",
    disagreement: "#ef4444",
    addition: "#3b82f6",
    paraphrase: "#8b5cf6",
    question: "#f59e0b",
    answer: "#06b6d4",
    topic_shift: "#ec4899",
    elaboration: "#64748b"
  }
  return colors[type] || "#94a3b8"
}

function getRelationLabel(type: string): string {
  const labels: Record<string, string> = {
    agreement: "同意",
    disagreement: "反対",
    addition: "付け足し",
    paraphrase: "言い換え",
    question: "質問",
    answer: "回答",
    topic_shift: "話題転換",
    elaboration: "詳細化"
  }
  return labels[type] || type
}

// Prepare timeline data for visualization
export function prepareTimelineData(result: AnalysisResult) {
  return result.utterances.map(u => {
    const topic = result.topics.find(t => t.utteranceIds.includes(u.id))
    const sentiment = result.quantitativeMetrics.sentimentScores.find(s => s.utteranceId === u.id)
    const codes = result.codes.find(c => c.utteranceId === u.id)
    
    return {
      id: u.id,
      speaker: u.speaker,
      speakerType: u.speakerType,
      content: u.content,
      topicName: topic?.name || "不明",
      isMainstream: topic?.isMainstream || false,
      sentiment: sentiment ? sentiment.positive - sentiment.negative : 0,
      engagement: sentiment?.engagement || 0,
      codes: codes?.codes || []
    }
  })
}
