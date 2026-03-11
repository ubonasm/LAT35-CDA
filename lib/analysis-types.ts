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

// 発言間の意味的距離
export const utteranceDistanceSchema = z.object({
  fromId: z.number(),
  toId: z.number(),
  semanticDistance: z.number().min(0).max(1),
  reason: z.string(),
})

export type UtteranceDistance = z.infer<typeof utteranceDistanceSchema>

// キーワード分析
export const distributionTypeSchema = z.enum(["mainstream", "sub", "high_frequency", "localized", "scattered"])

export type DistributionType = z.infer<typeof distributionTypeSchema>

export const keywordSchema = z.object({
  word: z.string(),
  frequency: z.number(),
  utteranceIds: z.array(z.number()),
  importance: z.number().min(0).max(1),
  category: z.enum(["concept", "action", "entity", "other"]),
  distributionType: distributionTypeSchema.optional(),
  distributionDescription: z.string().optional(),
})

export type Keyword = z.infer<typeof keywordSchema>

// キーワード分布タイプのラベル
export const distributionTypeLabels: Record<DistributionType, { ja: string, en: string }> = {
  mainstream: { ja: "メインストリーム", en: "Mainstream" },
  sub: { ja: "サブトピック", en: "Sub-topic" },
  high_frequency: { ja: "高頻度", en: "High Frequency" },
  localized: { ja: "局所的", en: "Localized" },
  scattered: { ja: "散在的", en: "Scattered" },
}

// 分布タイプの色
export const distributionTypeColors: Record<DistributionType, string> = {
  mainstream: "#3b82f6",
  sub: "#8b5cf6",
  high_frequency: "#22c55e",
  localized: "#f59e0b",
  scattered: "#06b6d4",
}

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

// 時系列分析の型
export const phaseSchema = z.object({
  phaseId: z.number(),
  phaseName: z.string(),
  startUtteranceId: z.number(),
  endUtteranceId: z.number(),
  dominantSpeakers: z.array(z.string()),
  keyKeywords: z.array(z.string()),
  characteristics: z.string(),
})

export type Phase = z.infer<typeof phaseSchema>

export const conceptEvolutionSchema = z.object({
  initialTerm: z.string(),
  evolvedTerm: z.string(),
  evolutionType: z.enum(["abstraction", "concretization", "synonym", "refinement"]),
  transitionUtteranceId: z.number(),
  description: z.string(),
})

export type ConceptEvolution = z.infer<typeof conceptEvolutionSchema>

export const speakerActivityShiftSchema = z.object({
  speakerId: z.string(),
  activityPattern: z.enum(["early_active", "late_active", "consistent", "intermittent", "single_burst"]),
  peakPhase: z.number(),
  activityByPhase: z.array(z.number()),
  significance: z.string(),
})

export type SpeakerActivityShift = z.infer<typeof speakerActivityShiftSchema>

export const turningPointSchema = z.object({
  utteranceId: z.number(),
  speakerId: z.string(),
  type: z.enum(["topic_shift", "concept_introduction", "consensus_building", "controversy", "resolution"]),
  description: z.string(),
  impact: z.enum(["high", "medium", "low"]),
})

export type TurningPoint = z.infer<typeof turningPointSchema>

export const temporalAnalysisSchema = z.object({
  phases: z.array(phaseSchema),
  conceptEvolution: z.array(conceptEvolutionSchema),
  speakerActivityShifts: z.array(speakerActivityShiftSchema),
  turningPoints: z.array(turningPointSchema),
})

export type TemporalAnalysis = z.infer<typeof temporalAnalysisSchema>

// 時系列分析のラベル
export const activityPatternLabels: Record<SpeakerActivityShift["activityPattern"], { ja: string, en: string }> = {
  early_active: { ja: "序盤活発", en: "Early Active" },
  late_active: { ja: "終盤活発", en: "Late Active" },
  consistent: { ja: "一貫して活発", en: "Consistent" },
  intermittent: { ja: "断続的", en: "Intermittent" },
  single_burst: { ja: "一時的活発", en: "Single Burst" },
}

export const evolutionTypeLabels: Record<ConceptEvolution["evolutionType"], { ja: string, en: string }> = {
  abstraction: { ja: "抽象化", en: "Abstraction" },
  concretization: { ja: "具体化", en: "Concretization" },
  synonym: { ja: "同義語化", en: "Synonym" },
  refinement: { ja: "精緻化", en: "Refinement" },
}

export const turningPointTypeLabels: Record<TurningPoint["type"], { ja: string, en: string }> = {
  topic_shift: { ja: "話題転換", en: "Topic Shift" },
  concept_introduction: { ja: "概念導入", en: "Concept Introduction" },
  consensus_building: { ja: "合意形成", en: "Consensus Building" },
  controversy: { ja: "論争", en: "Controversy" },
  resolution: { ja: "解決", en: "Resolution" },
}

// 分析結果全体の型
export const analysisResultSchema = z.object({
  relations: z.array(utteranceRelationSchema),
  segments: z.array(topicSegmentSchema),
  codes: z.array(utteranceCodeSchema),
  summary: z.string(),
  // 分節分析
  discourseSegments: z.array(discourseSegmentSchema).optional(),
  segmentRelations: z.array(segmentRelationSchema).optional(),
  // 発言間距離
  utteranceDistances: z.array(utteranceDistanceSchema).optional(),
  // キーワード分析
  keywords: z.array(keywordSchema).optional(),
  // 時系列分析
  temporalAnalysis: temporalAnalysisSchema.optional(),
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
