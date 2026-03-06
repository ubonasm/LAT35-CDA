# Classroom Discourse Analyzer / 授業談話分析ツール

AI-powered classroom discourse analysis tool that visualizes the structure of classroom discussions.

AIを活用して授業記録を分析し、発言間の関係性、トピック構造、隠れた影響者を可視化するツールです。

## Requirements / 必要なもの

1. **Node.js** (v18 or later) - [Download](https://nodejs.org/)
2. **Gemini API Key** - [Get it from Google AI Studio](https://aistudio.google.com/app/apikey)

## Quick Start / クイックスタート

### Windows

1. Install [Node.js](https://nodejs.org/)
2. Download and extract this project
3. Double-click `start-windows.bat`
4. Open http://localhost:3000 in your browser

<img width="255" height="479" alt="スクリーンショット 2026-03-06 142214" src="https://github.com/user-attachments/assets/15b24f28-b3ba-49f4-8b53-b9f18d4f1a43" />


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

<img width="1566" height="1100" alt="スクリーンショット 2026-03-06 142127" src="https://github.com/user-attachments/assets/cd01afb0-8250-4b1d-a0f0-72d5c5389118" />


3. Wait for AI analysis / AI分析を待つ

<img width="693" height="666" alt="スクリーンショット 2026-03-06 142334" src="https://github.com/user-attachments/assets/6e123929-c2fe-4514-8d22-748be5036868" />


4. Explore the results in different tabs / 各タブで結果を確認

<img width="1517" height="715" alt="スクリーンショット 2026-03-06 142511" src="https://github.com/user-attachments/assets/e160d902-ce22-480c-b85d-54b257487bdb" />



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
