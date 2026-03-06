export type Language = "ja" | "en"

export const translations = {
  ja: {
    // Header
    appTitle: "授業談話分析ツール",
    appSubtitle: "AIを活用した授業記録の構造分析・可視化",
    
    // API Settings
    apiSettings: "Gemini API設定",
    apiDescription: "分析にはGemini APIキーが必要です。",
    getApiKey: "Google AI Studioで取得",
    apiKeyPlaceholder: "AIza...",
    clear: "クリア",
    apiKeySaved: "APIキーはブラウザに保存されます（サーバーには保存されません）",
    
    // CSV Upload
    uploadTitle: "授業記録をアップロード",
    uploadDescription: "CSVファイル（発言番号,発言者,発言内容）をドラッグ＆ドロップまたは選択してください",
    dragDropHere: "ここにCSVファイルをドラッグ＆ドロップ",
    orClickToSelect: "またはクリックしてファイルを選択",
    csvFormat: "CSVフォーマット",
    csvFormatDescription: "発言番号,発言者,発言内容 の順で1行1発言。発言者名に「T」「先生」「教師」を含む場合は教師として認識されます。",
    preview: "プレビュー（最初の5件）",
    utterancesData: "件以上の発言データ",
    
    // Analysis
    analyzing: "Gemini AIで分析中...",
    analyzingDescription: "発言間の関係性、トピック構造、感情分析などを実行しています",
    analysisError: "分析中にエラーが発生しました",
    retry: "再試行",
    enterApiKey: "APIキーを入力してから分析を開始してください",
    startAnalysis: "分析を開始",
    
    // Tabs
    tabOverview: "概要",
    tabSegments: "分節",
    tabNetwork: "関係ネットワーク",
    tabStatistics: "統計分析",
    tabTimeline: "タイムライン",
    
    // Actions
    exportJson: "JSONエクスポート",
    newAnalysis: "新規分析",
    
    // Summary Cards
    totalUtterances: "総発言数",
    speakers: "発言者数",
    topics: "トピック数",
    hiddenInfluencers: "隠れた影響者",
    teacher: "教師",
    student: "児童生徒",
    mainTopic: "メイントピック",
    subTopics: "サブトピック",
    hiddenInfluencerDescription: "発言量は少ないが議論に影響を与えた人物",
    
    // Network
    networkTitle: "発言関係ネットワーク",
    networkDescription: "発言間の関係性（同意・反対・付け足しなど）を可視化",
    showRelations: "関係を表示",
    help: "ヘルプ",
    helpTitle: "ネットワーク図の見方",
    helpClose: "閉じる",
    helpNode: "ノード（円）",
    helpNodeDesc: "各発言を表します。番号は発言順を示します。",
    helpNodeColor: "ノードの色",
    helpNodeColorDesc: "青=教師、緑=児童生徒",
    helpPosition: "位置",
    helpPositionDesc: "横軸=発言の時間順、縦軸=教師（上段）と児童生徒（下段）を区別",
    helpEdge: "エッジ（線）",
    helpEdgeDesc: "発言間の関係を示します。",
    helpEdgeColor: "線の色",
    helpLegendAgreement: "同意",
    helpLegendDisagreement: "反対",
    helpLegendAddition: "付け足し",
    helpLegendParaphrase: "言い換え",
    helpLegendQuestion: "質問",
    helpLegendAnswer: "回答",
    helpLegendTopicShift: "話題転換",
    legendTitle: "凡例",
    upperRow: "上段: 教師",
    lowerRow: "下段: 児童生徒",
    
    // Statistics
    utteranceStats: "発言統計",
    utteranceStatsDesc: "発言者ごとの発言回数と文字数（発言回数順）",
    count: "回数",
    characters: "文字数",
    
    centralityTitle: "中心性分析",
    centralityDesc: "誰が議論の中心にいるかを複数の指標で分析",
    degreeCentrality: "次数中心性",
    degreeCentralityDesc: "他の発言との直接的なつながりの多さ",
    betweennessCentrality: "媒介中心性",
    betweennessCentralityDesc: "議論の橋渡し役としての重要度",
    influenceScore: "影響度スコア",
    influenceScoreDesc: "議論への総合的な影響力",
    centralityOverTime: "中心性の時間推移",
    centralityOverTimeDesc: "発言番号ごとの累積中心性の推移",
    utteranceNumber: "発言番号",
    cumulativeCentrality: "累積中心性",
    
    relationDistribution: "関係性分布",
    relationDistributionDesc: "発言間の関係タイプの分布",
    relationTypeDistribution: "関係タイプ分布",
    topicUtteranceCount: "トピック別発言数",
    exportPng: "PNG出力",
    exportJpg: "JPG出力",
    clickToShowUtterances: "クリックすると該当する発言を表示します",
    relatedUtterances: "該当する発言",
    
    engagementTitle: "関与度推移",
    engagementDesc: "授業中の議論への関与度の推移",
    engagement: "関与度",
    
    teacherIntervention: "教師介入分析",
    teacherInterventionDesc: "教師の発言パターンと影響分析",
    interventionType: "介入タイプ分布",
    timingAnalysis: "介入タイミング分析",
    consecutiveStudent: "連続児童発言数",
    question: "質問",
    instruction: "指示",
    feedback: "フィードバック",
    facilitation: "促進",
    explanation: "説明",
    other: "その他",
    
    // Timeline
    timelineTitle: "発言タイムライン",
    timelineDescription: "発言の時系列表示とコーディング結果",
    showCodes: "コードを表示",
    topic: "トピック",
    sentiment: "感情",
    positive: "ポジティブ",
    negative: "ネガティブ",
    neutral: "中立",
    codes: "コード",
    relations: "関係",
    
    // Relation types
    agreement: "同意",
    disagreement: "反対",
    addition: "付け足し",
    paraphrase: "言い換え",
    questionType: "質問",
    answer: "回答",
    topicShift: "話題転換",
  },
  en: {
    // Header
    appTitle: "Classroom Discourse Analyzer",
    appSubtitle: "AI-powered structural analysis and visualization of classroom records",
    
    // API Settings
    apiSettings: "Gemini API Settings",
    apiDescription: "A Gemini API key is required for analysis.",
    getApiKey: "Get from Google AI Studio",
    apiKeyPlaceholder: "AIza...",
    clear: "Clear",
    apiKeySaved: "API key is saved in your browser (not sent to server)",
    
    // CSV Upload
    uploadTitle: "Upload Classroom Record",
    uploadDescription: "Drag & drop or select a CSV file (utterance_number, speaker, content)",
    dragDropHere: "Drag & drop CSV file here",
    orClickToSelect: "or click to select file",
    csvFormat: "CSV Format",
    csvFormatDescription: "One utterance per line: utterance_number, speaker, content. Speakers containing 'T', 'Teacher', or 'Instructor' are recognized as teachers.",
    preview: "Preview (first 5)",
    utterancesData: "+ utterances",
    
    // Analysis
    analyzing: "Analyzing with Gemini AI...",
    analyzingDescription: "Analyzing utterance relationships, topic structure, sentiment, etc.",
    analysisError: "An error occurred during analysis",
    retry: "Retry",
    enterApiKey: "Please enter API key before starting analysis",
    startAnalysis: "Start Analysis",
    
    // Tabs
    tabOverview: "Overview",
    tabSegments: "Segments",
    tabNetwork: "Relation Network",
    tabStatistics: "Statistics",
    tabTimeline: "Timeline",
    
    // Actions
    exportJson: "Export JSON",
    newAnalysis: "New Analysis",
    
    // Summary Cards
    totalUtterances: "Total Utterances",
    speakers: "Speakers",
    topics: "Topics",
    hiddenInfluencers: "Hidden Influencers",
    teacher: "Teacher",
    student: "Student",
    mainTopic: "Main Topic",
    subTopics: "Sub-topics",
    hiddenInfluencerDescription: "People who influenced discussion despite low utterance count",
    
    // Network
    networkTitle: "Utterance Relation Network",
    networkDescription: "Visualize relationships between utterances (agreement, disagreement, addition, etc.)",
    showRelations: "Show Relations",
    help: "Help",
    helpTitle: "How to Read the Network",
    helpClose: "Close",
    helpNode: "Nodes (circles)",
    helpNodeDesc: "Each node represents an utterance. Numbers indicate utterance order.",
    helpNodeColor: "Node Color",
    helpNodeColorDesc: "Blue=Teacher, Green=Student",
    helpPosition: "Position",
    helpPositionDesc: "X-axis=chronological order, Y-axis=Teacher (top) vs Student (bottom)",
    helpEdge: "Edges (lines)",
    helpEdgeDesc: "Indicate relationships between utterances.",
    helpEdgeColor: "Line Color",
    helpLegendAgreement: "Agreement",
    helpLegendDisagreement: "Disagreement",
    helpLegendAddition: "Addition",
    helpLegendParaphrase: "Paraphrase",
    helpLegendQuestion: "Question",
    helpLegendAnswer: "Answer",
    helpLegendTopicShift: "Topic Shift",
    legendTitle: "Legend",
    upperRow: "Top: Teacher",
    lowerRow: "Bottom: Students",
    
    // Statistics
    utteranceStats: "Utterance Statistics",
    utteranceStatsDesc: "Utterance count and character count by speaker (sorted by frequency)",
    count: "Count",
    characters: "Characters",
    
    centralityTitle: "Centrality Analysis",
    centralityDesc: "Analyze who is at the center of discussion using multiple metrics",
    degreeCentrality: "Degree Centrality",
    degreeCentralityDesc: "Number of direct connections with other utterances",
    betweennessCentrality: "Betweenness Centrality",
    betweennessCentralityDesc: "Importance as a bridge in discussion",
    influenceScore: "Influence Score",
    influenceScoreDesc: "Overall influence on discussion",
    centralityOverTime: "Centrality Over Time",
    centralityOverTimeDesc: "Cumulative centrality progression by utterance number",
    utteranceNumber: "Utterance #",
    cumulativeCentrality: "Cumulative Centrality",
    
    relationDistribution: "Relation Distribution",
    relationDistributionDesc: "Distribution of relationship types between utterances",
    relationTypeDistribution: "Relation Type Distribution",
    topicUtteranceCount: "Utterances by Topic",
    exportPng: "Export PNG",
    exportJpg: "Export JPG",
    clickToShowUtterances: "Click to show related utterances",
    relatedUtterances: "Related Utterances",
    
    engagementTitle: "Engagement Progression",
    engagementDesc: "Progression of discussion engagement during class",
    engagement: "Engagement",
    
    teacherIntervention: "Teacher Intervention Analysis",
    teacherInterventionDesc: "Teacher utterance patterns and impact analysis",
    interventionType: "Intervention Type Distribution",
    timingAnalysis: "Intervention Timing Analysis",
    consecutiveStudent: "Consecutive Student Utterances",
    question: "Question",
    instruction: "Instruction",
    feedback: "Feedback",
    facilitation: "Facilitation",
    explanation: "Explanation",
    other: "Other",
    
    // Timeline
    timelineTitle: "Utterance Timeline",
    timelineDescription: "Chronological display of utterances with coding results",
    showCodes: "Show Codes",
    topic: "Topic",
    sentiment: "Sentiment",
    positive: "Positive",
    negative: "Negative",
    neutral: "Neutral",
    codes: "Codes",
    relations: "Relations",
    
    // Relation types
    agreement: "Agreement",
    disagreement: "Disagreement",
    addition: "Addition",
    paraphrase: "Paraphrase",
    questionType: "Question",
    answer: "Answer",
    topicShift: "Topic Shift",
  }
} as const

export type TranslationKey = keyof typeof translations.ja

export function getTranslation(lang: Language, key: TranslationKey): string {
  return translations[lang][key] || translations.ja[key] || key
}
