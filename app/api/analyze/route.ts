import { GoogleGenerativeAI } from "@google/generative-ai"
import type { Utterance, AnalysisResult, UtteranceRelation, Topic, UtteranceCode } from "@/lib/analysis-types"

export async function POST(req: Request) {
  try {
    const { utterances, apiKey } = await req.json() as { utterances: Utterance[], apiKey?: string }
    
    // Check for API key - from request body or environment variable
    const geminiApiKey = apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    
    if (!geminiApiKey) {
      return Response.json({ 
        error: "APIキーが設定されていません", 
        needsApiKey: true 
      }, { status: 400 })
    }
    
    if (!utterances || utterances.length === 0) {
      return Response.json({ error: "発言データが必要です" }, { status: 400 })
    }
    
    // Create Google Generative AI client
    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" })

    // Format utterances for analysis
    const utteranceText = utterances.map(u => 
      `[${u.id}] ${u.speaker}（${u.speakerType === "teacher" ? "教師" : "生徒"}）: ${u.content}`
    ).join("\n")

    const prompt = `あなたは教育学の専門家で、授業談話分析のエキスパートです。
以下の授業記録を詳細に分析してください。

分析の観点：
1. 発言間の関係性（同意、反対、付け足し、言い換え、質問、回答、話題転換、詳細化）
2. トピックの構造（メインストリームとサブトピック）
3. 各発言のコーディング（認知的、社会的、手続き的、メタ認知的）
4. 感情・態度分析（ポジティブ、ネガティブ、ニュートラル、関与度、確信度）
5. 隠れた影響者の検出（発言量は少ないが議論の方向性に影響を与えた生徒）
6. 教師の介入分析（リダイレクト、足場かけ、明確化、承認、挑戦、要約）
7. 分節分析（授業を意味のあるまとまり＝分節に分け、分節間の関係を分析）

特に以下の点に注意してください：
- 表面的な発言量だけでなく、議論の質的な貢献度を評価する
- 教師が明示的にコントロールしているように見えても、実際には生徒の発言が議論を導いている場合を検出する
- 同じ話題でも異なる文脈で扱われている場合はサブトピックとして区別する
- 分節は連続した発言のまとまりで、意味的なまとまりを持つ単位として抽出する

【授業記録】
${utteranceText}

【出力形式】
以下のJSON形式で分析結果を出力してください。JSONのみを出力し、他の文章は含めないでください。

{
  "relations": [
    {
      "fromId": <発言番号（元）>,
      "toId": <発言番号（先）>,
      "type": "<agreement|disagreement|addition|paraphrase|question|answer|topic_shift|elaboration>",
      "strength": <0-1の数値>,
      "description": "<関係の説明>"
    }
  ],
  "topics": [
    {
      "id": "<トピックID>",
      "name": "<トピック名>",
      "isMainstream": <true|false>,
      "utteranceIds": [<発言番号の配列>],
      "startId": <開始発言番号>,
      "endId": <終了発言番号>,
      "parentTopicId": "<親トピックID または null>"
    }
  ],
  "utteranceDistances": [
    {
      "fromId": <発言番号1>,
      "toId": <発言番号2>,
      "semanticDistance": <0-1の数値。0が最も近い、1が最も遠い>,
      "reason": "<距離の理由（内容の類似性、論理的つながりなど）>"
    }
  ],
  "codes": [
    {
      "utteranceId": <発言番号>,
      "codes": [
        {
          "category": "<cognitive|social|procedural|metacognitive>",
          "code": "<具体的なコード>",
          "description": "<コードの説明>"
        }
      ]
    }
  ],
  "sentimentScores": [
    {
      "utteranceId": <発言番号>,
      "positive": <0-1>,
      "negative": <0-1>,
      "neutral": <0-1>,
      "engagement": <0-1>,
      "confidence": <0-1>
    }
  ],
  "hiddenInfluencers": [
    {
      "speakerId": "<発言者名>",
      "influenceScore": <0-1>,
      "reason": "<影響の理由>",
      "keyUtteranceIds": [<重要な発言番号>]
    }
  ],
  "teacherInterventions": [
    {
      "utteranceId": <発言番号>,
      "type": "<redirect|scaffold|clarify|validate|challenge|summarize>",
      "impact": "<high|medium|low>",
      "description": "<介入の説明>"
    }
  ],
  "summary": {
    "mainTheme": "<授業の主題>",
    "keyInsights": ["<主な発見1>", "<主な発見2>"],
    "discussionQuality": <0-1>,
    "studentParticipation": <0-1>
  },
  "discourseSegments": [
    {
      "id": <分節ID（1から連番）>,
      "startUtteranceId": <開始発言番号>,
      "endUtteranceId": <終了発言番号>,
      "label": "<分節のラベル（短い名前）>",
      "description": "<分節の説明（何が行われているか）>",
      "mainSpeaker": "<主要な発言者名 または null>",
      "segmentType": "<opening|development|climax|conclusion|digression|transition>"
    }
  ],
  "segmentRelations": [
    {
      "fromSegmentId": <元の分節ID>,
      "toSegmentId": <先の分節ID>,
      "relationType": "<continuation|succession|topic_shift|deepening|branching|return|summary>",
      "description": "<関係の説明>"
    }
  ],
  "keywords": [
    {
      "word": "<キーワード>",
      "frequency": <出現回数>,
      "utteranceIds": [<出現した発言番号の配列>],
      "importance": <0-1の重要度スコア>,
      "category": "<concept|action|entity|other>",
      "distributionType": "<mainstream|sub|high_frequency|localized|scattered>",
      "distributionDescription": "<分布の説明>"
    }
  ]
}

【キーワード抽出の指示】
keywordsには必ず20個以上のキーワードを抽出してください。以下の基準で多様なキーワードを選出してください：
1. メインストリーム（mainstream）: 授業の主要テーマを構成する単語（5-7個）
2. サブトピック（sub）: サブトピックを形成する単語（3-5個）
3. 高頻度（high_frequency）: 出現回数が多い単語（5-7個）
4. 局所的（localized）: 特定の発言番号に集中して出現する単語（3-5個）
5. 散在的（scattered）: 発言全体に分散して出現する単語（3-5個）

それぞれのdistributionTypeを適切に設定し、distributionDescriptionにその理由を記載してください。

また、以下の時系列分析も出力に追加してください：

"temporalAnalysis": {
  "phases": [
    {
      "phaseId": <フェーズ番号>,
      "phaseName": "<フェーズ名（導入、展開、深化、まとめなど）>",
      "startUtteranceId": <開始発言番号>,
      "endUtteranceId": <終了発言番号>,
      "dominantSpeakers": ["<主要な発言者>"],
      "keyKeywords": ["<このフェーズの重要キーワード>"],
      "characteristics": "<このフェーズの特徴>"
    }
  ],
  "conceptEvolution": [
    {
      "initialTerm": "<初期に使われた語>",
      "evolvedTerm": "<後に使われるようになった語>",
      "evolutionType": "<abstraction|concretization|synonym|refinement>",
      "transitionUtteranceId": <転換点の発言番号>,
      "description": "<変遷の説明>"
    }
  ],
  "speakerActivityShifts": [
    {
      "speakerId": "<発言者名>",
      "activityPattern": "<early_active|late_active|consistent|intermittent|single_burst>",
      "peakPhase": <最も活発だったフェーズ番号>,
      "activityByPhase": [<各フェーズでの発言数>],
      "significance": "<この発言者の時系列的な意義>"
    }
  ],
  "turningPoints": [
    {
      "utteranceId": <転換点の発言番号>,
      "speakerId": "<発言者名>",
      "type": "<topic_shift|concept_introduction|consensus_building|controversy|resolution>",
      "description": "<転換点の説明>",
      "impact": "<high|medium|low>"
    }
  ]
}`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()
    
    // Parse JSON from response
    let analysisData
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : text
      analysisData = JSON.parse(jsonStr.trim())
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Response:", text.substring(0, 500))
      return Response.json({ 
        error: "分析結果のパースに失敗しました", 
        details: "AIからの応答をJSONとして解析できませんでした"
      }, { status: 500 })
    }

    // Calculate quantitative metrics
    const speakerStats = calculateSpeakerStats(utterances)
    const networkMetrics = calculateNetworkMetrics(utterances, analysisData.relations as UtteranceRelation[])
    const topicDurations = calculateTopicDurations(analysisData.topics as Topic[], utterances)

    const analysisResult: AnalysisResult = {
      utterances,
      relations: analysisData.relations as UtteranceRelation[],
      topics: analysisData.topics as Topic[],
      codes: analysisData.codes as UtteranceCode[],
      quantitativeMetrics: {
        speakerStats,
        networkMetrics,
        topicDurations,
        sentimentScores: analysisData.sentimentScores,
        teacherInterventions: analysisData.teacherInterventions
      },
      hiddenInfluencers: analysisData.hiddenInfluencers,
      summary: analysisData.summary,
      // 分節分析結果
      discourseSegments: analysisData.discourseSegments || [],
      segmentRelations: analysisData.segmentRelations || [],
      // 発言間距離
      utteranceDistances: analysisData.utteranceDistances || [],
      // キーワード分析
      keywords: analysisData.keywords || [],
      // 時系列分析
      temporalAnalysis: analysisData.temporalAnalysis || null
    }

    return Response.json(analysisResult)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    
    // Check for common API key errors
    if (errorMessage.includes("API_KEY") || errorMessage.includes("401") || errorMessage.includes("403") || errorMessage.includes("INVALID")) {
      return Response.json({ 
        error: "APIキーが無効です。正しいAPIキーを入力してください。", 
        needsApiKey: true 
      }, { status: 401 })
    }
    
    return Response.json({ 
      error: "分析中にエラーが発生しました", 
      details: errorMessage
    }, { status: 500 })
  }
}

function calculateSpeakerStats(utterances: Utterance[]) {
  const stats: Record<string, {
    speakerId: string
    speakerType: "teacher" | "student"
    utteranceCount: number
    totalCharacters: number
    totalWords: number
    averageLength: number
    firstUtterance: number
    lastUtterance: number
  }> = {}

  utterances.forEach(u => {
    if (!stats[u.speaker]) {
      stats[u.speaker] = {
        speakerId: u.speaker,
        speakerType: u.speakerType,
        utteranceCount: 0,
        totalCharacters: 0,
        totalWords: 0,
        averageLength: 0,
        firstUtterance: u.id,
        lastUtterance: u.id
      }
    }
    
    const s = stats[u.speaker]
    s.utteranceCount++
    s.totalCharacters += u.content.length
    // Japanese word count approximation (characters / 2 for Japanese)
    s.totalWords += Math.ceil(u.content.length / 2)
    s.lastUtterance = u.id
  })

  // Calculate averages
  Object.values(stats).forEach(s => {
    s.averageLength = s.totalCharacters / s.utteranceCount
  })

  return Object.values(stats)
}

function calculateNetworkMetrics(utterances: Utterance[], relations: UtteranceRelation[]) {
  // Build adjacency map for speakers
  const speakerConnections: Record<string, Set<string>> = {}
  const speakerInfluence: Record<string, number> = {}
  
  utterances.forEach(u => {
    speakerConnections[u.speaker] = new Set()
    speakerInfluence[u.speaker] = 0
  })

  // Map utterance IDs to speakers
  const utteranceToSpeaker: Record<number, string> = {}
  utterances.forEach(u => {
    utteranceToSpeaker[u.id] = u.speaker
  })

  // Calculate connections
  relations.forEach(r => {
    const fromSpeaker = utteranceToSpeaker[r.fromId]
    const toSpeaker = utteranceToSpeaker[r.toId]
    
    if (fromSpeaker && toSpeaker && fromSpeaker !== toSpeaker) {
      speakerConnections[fromSpeaker].add(toSpeaker)
      speakerConnections[toSpeaker].add(fromSpeaker)
      
      // Influence based on relation type
      const influenceWeight = r.type === "topic_shift" ? 0.3 : 
                              r.type === "elaboration" ? 0.2 :
                              r.type === "question" ? 0.15 : 0.1
      speakerInfluence[fromSpeaker] += influenceWeight * r.strength
    }
  })

  // Calculate centrality metrics
  const metrics = Object.keys(speakerConnections).map(speaker => {
    const connections = speakerConnections[speaker].size
    const totalPossible = Object.keys(speakerConnections).length - 1
    const degreeCentrality = totalPossible > 0 ? connections / totalPossible : 0
    
    // Betweenness approximation based on how many relations pass through this speaker
    const incomingRelations = relations.filter(r => utteranceToSpeaker[r.toId] === speaker).length
    const outgoingRelations = relations.filter(r => utteranceToSpeaker[r.fromId] === speaker).length
    const betweennessCentrality = (incomingRelations + outgoingRelations) / (relations.length || 1)
    
    // Influence centrality
    const maxInfluence = Math.max(...Object.values(speakerInfluence), 1)
    const influenceCentrality = speakerInfluence[speaker] / maxInfluence

    return {
      speakerId: speaker,
      degreeCentrality,
      betweennessCentrality,
      influenceCentrality,
      hubScore: (degreeCentrality + betweennessCentrality + influenceCentrality) / 3
    }
  })

  return metrics
}

function calculateTopicDurations(topics: Topic[], utterances: Utterance[]) {
  return topics.map(topic => {
    const topicUtterances = utterances.filter(u => topic.utteranceIds.includes(u.id))
    const duration = topic.endId - topic.startId + 1
    const transitions = topics.filter(t => 
      t.startId === topic.endId + 1 || t.endId === topic.startId - 1
    ).length

    return {
      topicId: topic.id,
      topicName: topic.name,
      duration,
      utteranceCount: topicUtterances.length,
      transitionCount: transitions
    }
  })
}
