import { z } from "zod"

// CSV入力データの型
export interface Utterance {
  id: number
  speaker: string
  content: string
  speakerType: "teacher" | "student"
}

// 発言関係の型
export const relationTypeSchema = z.enum([
  "agreement",
  "disagreement",
  "addition",
  "paraphrase",
  "question",
  "answer",
  "clarification",
  "redirect",
  "evaluation",
])

export type RelationType = z.infer<typeof relationTypeSchema>

export const utteranceRelationSchema = z.object({
  fromId: z.number(),
  toId: z.number(),
  relationType: relationTypeSchema,
  strength: z.number().min(0).max(1),
})

export type UtteranceRelation = z.infer<typeof utteranceRelationSchema>

// トピックセグメントの型
export const topicSegmentSchema = z.object({
  id: z.number(),
  startId: z.number(),
  endId: z.number(),
  topic: z.string(),
  isMainstream: z.boolean(),
  parentSegmentId: z.number().nullable(),
})

export type TopicSegment = z.infer<typeof topicSegmentSchema>

// 分節間の関係タイプ
export const segmentRelationTypeSchema = z.enum([
  "continuation",    // 継続
  "succession",      // 引継ぎ
  "topic_shift",     // 話題転換
  "deepening",       // 深化
  "branching",       // 分岐
  "return",          // 回帰
  "summary",         // まとめ
])

export type SegmentRelationType = z.infer<typeof segmentRelationTypeSchema>

// 分節（発言のまとまり）の型
export const discourseSegmentSchema = z.object({
  id: z.number(),
  startUtteranceId: z.number(),
  endUtteranceId: z.number(),
  label: z.string(),
  description: z.string(),
  mainSpeaker: z.string().nullable(),
  segmentType: z.enum(["opening", "development", "climax", "conclusion", "digression", "transition"]),
})

export type DiscourseSegment = z.infer<typeof discourseSegmentSchema>

// 分節間の関係
export const segmentRelationSchema = z.object({
  fromSegmentId: z.number(),
  toSegmentId: z.number(),
  relationType: segmentRelationTypeSchema,
  description: z.string(),
})

export type SegmentRelation = z.infer<typeof segmentRelationSchema>

// 発言コードの型
export const utteranceCodeTypeSchema = z.enum([
  "initiation",
  "response",
  "evaluation",
  "followup",
  "scaffolding",
  "revoicing",
  "probe",
  "summary",
  "transition",
])

export type UtteranceCodeType = z.infer<typeof utteranceCodeTypeSchema>

export const utteranceCodeSchema = z.object({
  id: z.number(),
  codes: z.array(utteranceCodeTypeSchema),
  sentiment: z.number().min(-1).max(1),
  keyInfluencer: z.boolean(),
})

export type UtteranceCode = z.infer<typeof utteranceCodeSchema>

// 分析結果全体の型
export const analysisResultSchema = z.object({
  relations: z.array(utteranceRelationSchema),
  segments: z.array(topicSegmentSchema),
  codes: z.array(utteranceCodeSchema),
  summary: z.string(),
  // 分節分析
  discourseSegments: z.array(discourseSegmentSchema).optional(),
  segmentRelations: z.array(segmentRelationSchema).optional(),
})

export type AnalysisResult = z.infer<typeof analysisResultSchema>

// 量的分析の型
export interface SpeakerStatistics {
  speaker: string
  speakerType: "teacher" | "student"
  utteranceCount: number
  totalCharacters: number
  averageCharacters: number
  totalWords: number
  averageWords: number
}

export interface CentralityMetrics {
  speaker: string
  degreeCentrality: number
  betweennessCentrality: number
  closenessCentrality: number
  eigenvectorCentrality: number
}

export interface UtteranceCentrality {
  id: number
  degreeCentrality: number
  betweennessCentrality: number
  closenessCentrality: number
}

export interface TopicStatistics {
  segmentId: number
  topic: string
  duration: number // 発言数
  isMainstream: boolean
}

export interface TeacherInterventionPoint {
  utteranceId: number
  type: "redirect" | "scaffold" | "evaluate" | "probe"
  effectIndex: number // 介入後の議論活性度変化
}

export interface QuantitativeAnalysis {
  speakerStats: SpeakerStatistics[]
  teacherStudentRatio: {
    teacherUtterances: number
    studentUtterances: number
    ratio: number
  }
  centralityByUtterance: UtteranceCentrality[]
  centralityBySpeaker: CentralityMetrics[]
  topicStats: TopicStatistics[]
  teacherInterventions: TeacherInterventionPoint[]
  sentimentTimeline: Array<{
    id: number
    speaker: string
    sentiment: number
  }>
}

// ダッシュボード用の統合データ型
export interface DashboardData {
  utterances: Utterance[]
  analysis: AnalysisResult
  quantitative: QuantitativeAnalysis
}

// 関係タイプの表示名（日本語）
export const relationTypeLabels: Record<RelationType, string> = {
  agreement: "同意",
  disagreement: "反対",
  addition: "付け足し",
  paraphrase: "言い換え",
  question: "質問",
  answer: "回答",
  clarification: "明確化要求",
  redirect: "話題転換",
  evaluation: "評価",
}

// コードタイプの表示名（日本語）
export const codeTypeLabels: Record<UtteranceCodeType, string> = {
  initiation: "発議",
  response: "応答",
  evaluation: "評価",
  followup: "フォローアップ",
  scaffolding: "足場かけ",
  revoicing: "言い直し",
  probe: "深掘り",
  summary: "まとめ",
  transition: "転換",
}

// 関係タイプの色
export const relationTypeColors: Record<RelationType, string> = {
  agreement: "#22c55e",
  disagreement: "#ef4444",
  addition: "#3b82f6",
  paraphrase: "#8b5cf6",
  question: "#f59e0b",
  answer: "#06b6d4",
  clarification: "#ec4899",
  redirect: "#6366f1",
  evaluation: "#84cc16",
}

// 分節関係タイプの表示名（日本語）
export const segmentRelationTypeLabels: Record<SegmentRelationType, string> = {
  continuation: "継続",
  succession: "引継ぎ",
  topic_shift: "話題転換",
  deepening: "深化",
  branching: "分岐",
  return: "回帰",
  summary: "まとめ",
}

// 分節関係タイプの色
export const segmentRelationTypeColors: Record<SegmentRelationType, string> = {
  continuation: "#22c55e",
  succession: "#3b82f6",
  topic_shift: "#f59e0b",
  deepening: "#8b5cf6",
  branching: "#ec4899",
  return: "#06b6d4",
  summary: "#84cc16",
}

// 分節タイプの表示名
export const segmentTypeLabels: Record<DiscourseSegment["segmentType"], string> = {
  opening: "導入",
  development: "展開",
  climax: "山場",
  conclusion: "まとめ",
  digression: "脱線",
  transition: "転換",
}
