# Classroom Discourse Analyzer / 授業談話分析ツール

AI-powered classroom discourse analysis tool that visualizes the structure of classroom discussions.

AIを活用して授業記録を分析し、発言間の関係性、トピック構造、隠れた影響者を可視化するツールです。

## Features / 機能

- **Relation Network / 関係ネットワーク**: Visualize relationships between utterances (agreement, disagreement, addition, etc.)
- **Statistical Analysis / 統計分析**: Speaker statistics, centrality analysis, topic distribution
- **Timeline View / タイムライン表示**: Chronological view of all utterances with coding
- **Bilingual Support / 多言語対応**: Japanese and English interface
- **Export / エクスポート**: Export analysis results as JSON, charts as PNG/JPG

## Requirements / 必要なもの

1. **Node.js** (v18 or later) - [Download](https://nodejs.org/)
2. **Gemini API Key** - [Get it from Google AI Studio](https://aistudio.google.com/app/apikey)

## Quick Start / クイックスタート

### Windows

1. Install [Node.js](https://nodejs.org/)
2. Download and extract this project
3. Double-click `start-windows.bat`
4. Open http://localhost:3000 in your browser

### Mac / Linux

1. Install [Node.js](https://nodejs.org/)
2. Download and extract this project
3. Open Terminal in the project folder
4. Run:
   ```bash
   chmod +x start-mac-linux.sh
   ./start-mac-linux.sh
   ```
5. Open http://localhost:3000 in your browser

### Manual Installation / 手動インストール

```bash
# Install pnpm (if not installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Then open http://localhost:3000 in your browser.

## CSV Format / CSVフォーマット

The CSV file should have 3 columns:
CSVファイルは3列で構成されます：

```
発言番号,発言者,発言内容
1,T,今日は三角形について学びます
2,A子,先生、三角形って何ですか？
3,T,いい質問ですね。三角形とは...
```

- Column 1: Utterance number / 発言番号
- Column 2: Speaker name (T, 先生, 教師 = Teacher) / 発言者名
- Column 3: Utterance content / 発言内容

## Usage / 使い方

1. Enter your Gemini API key / Gemini APIキーを入力
2. Upload a CSV file / CSVファイルをアップロード
3. Wait for AI analysis / AI分析を待つ
4. Explore the results in different tabs / 各タブで結果を確認

## Deployment / デプロイ

### Vercel (Recommended)

The easiest way to deploy is using Vercel:

1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

### Self-hosted

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## License / ライセンス

MIT License

## Support / サポート

For issues or questions, please create an issue on GitHub.
問題や質問がある場合は、GitHubでissueを作成してください。
