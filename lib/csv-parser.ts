import Papa from "papaparse"
import type { Utterance } from "./analysis-types"

export interface ParseResult {
  success: boolean
  data: Utterance[]
  errors: string[]
}

// 教師を識別するキーワード
const teacherKeywords = ["教師", "先生", "T", "Teacher", "teacher"]

function isTeacher(speaker: string): boolean {
  return teacherKeywords.some(
    (keyword) =>
      speaker.toLowerCase().includes(keyword.toLowerCase()) ||
      speaker === keyword
  )
}

export function parseCSV(csvContent: string): ParseResult {
  const errors: string[] = []
  const utterances: Utterance[] = []

  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  })

  if (result.errors.length > 0) {
    errors.push(
      ...result.errors.map((e) => `行 ${e.row}: ${e.message}`)
    )
  }

  // ヘッダーの検出（複数パターンに対応）
  const headers = result.meta.fields || []
  
  // 発言番号のカラム名候補
  const idColumns = ["発言番号", "番号", "No", "NO", "no", "id", "ID", "num", "number"]
  // 発言者のカラム名候補
  const speakerColumns = ["発言者", "話者", "speaker", "Speaker", "name", "Name", "氏名"]
  // 発言内容のカラム名候補
  const contentColumns = ["発言内容", "内容", "発言", "content", "Content", "text", "Text", "utterance"]

  const idColumn = headers.find((h) => idColumns.includes(h))
  const speakerColumn = headers.find((h) => speakerColumns.includes(h))
  const contentColumn = headers.find((h) => contentColumns.includes(h))

  if (!idColumn || !speakerColumn || !contentColumn) {
    const missing: string[] = []
    if (!idColumn) missing.push("発言番号")
    if (!speakerColumn) missing.push("発言者")
    if (!contentColumn) missing.push("発言内容")
    errors.push(
      `必要なカラムが見つかりません: ${missing.join(", ")}。` +
      `対応カラム名: 発言番号(${idColumns.join("/")}), ` +
      `発言者(${speakerColumns.join("/")}), ` +
      `発言内容(${contentColumns.join("/")})`
    )
    return { success: false, data: [], errors }
  }

  // データの処理
  for (let i = 0; i < result.data.length; i++) {
    const row = result.data[i] as Record<string, string>
    
    const idStr = row[idColumn]?.trim()
    const speaker = row[speakerColumn]?.trim()
    const content = row[contentColumn]?.trim()

    // 空行をスキップ
    if (!idStr && !speaker && !content) continue

    // バリデーション
    if (!idStr) {
      errors.push(`行 ${i + 2}: 発言番号が空です`)
      continue
    }

    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      errors.push(`行 ${i + 2}: 発言番号が数値ではありません: "${idStr}"`)
      continue
    }

    if (!speaker) {
      errors.push(`行 ${i + 2}: 発言者が空です`)
      continue
    }

    if (!content) {
      errors.push(`行 ${i + 2}: 発言内容が空です`)
      continue
    }

    utterances.push({
      id,
      speaker,
      content,
      speakerType: isTeacher(speaker) ? "teacher" : "student",
    })
  }

  // IDでソート
  utterances.sort((a, b) => a.id - b.id)

  // 重複IDチェック
  const idSet = new Set<number>()
  for (const u of utterances) {
    if (idSet.has(u.id)) {
      errors.push(`発言番号 ${u.id} が重複しています`)
    }
    idSet.add(u.id)
  }

  return {
    success: errors.length === 0 && utterances.length > 0,
    data: utterances,
    errors,
  }
}

// サンプルCSVを生成（デモ用）
export function generateSampleCSV(): string {
  return `発言番号,発言者,発言内容
1,教師,今日は三角形の面積について考えます。四角形の面積の求め方は覚えていますか？
2,児童A,縦かける横です！
3,教師,そうですね。では三角形はどうでしょうか？
4,児童B,四角形の半分だと思います。
5,児童C,私もそう思います。対角線で切ると三角形になるから。
6,教師,なるほど、Cさんは理由も言ってくれましたね。どういうことかもう少し説明してくれますか？
7,児童C,四角形を対角線で切ると、同じ大きさの三角形が2つできます。だから三角形は四角形の半分です。
8,児童D,でも、すべての三角形が四角形の半分になるの？直角三角形じゃないとだめじゃない？
9,教師,いい質問ですね。Dさんの疑問について、みんなで考えてみましょう。
10,児童A,確かに、正三角形とかは四角形にならない気がする。
11,児童E,でも、どんな三角形でも、同じ三角形を2つ組み合わせると平行四辺形になると思う。
12,教師,Eさん、それは面白い考えですね。なぜそう思いましたか？
13,児童E,前に折り紙でやったことがあって、三角形を2つ組み合わせたら平行四辺形ができたから。
14,児童B,じゃあ、三角形の面積は平行四辺形の面積の半分ということ？
15,教師,みんなの意見をまとめると、三角形の面積は底辺かける高さ割る2で求められそうですね。`
}
