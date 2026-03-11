"use client"

import { AnalysisDashboard } from "@/components/analysis/analysis-dashboard"
import { LanguageSwitcher } from "@/components/language-switcher"
import { LanguageProvider, useLanguage } from "@/lib/language-context"
import { BookOpen, Network, BarChart3, Clock } from "lucide-react"

function HomeContent() {
  const { language } = useLanguage()
  
  const content = {
    ja: {
      features: "機能",
      startAnalysis: "分析開始",
      heroTitle: "AIで授業の構造を可視化する",
      heroDescription: "Gemini AIを活用して、授業記録から発言間の関係性、トピック構造、隠れた影響者を分析し、質的・量的な観点から授業を多角的に理解します。",
      feature1Title: "関係ネットワーク",
      feature1Desc: "同意・反対・付け足しなどの関係を可視化",
      feature2Title: "量的分析",
      feature2Desc: "中心性指標・感情スコア・発言統計",
      feature3Title: "タイムライン",
      feature3Desc: "発言の時系列表示とコーディング",
      feature4Title: "隠れた影響者",
      feature4Desc: "議論を導いた重要な発言者を検出",
      footerPowered: "Powered by Gemini AI",
      footerDesc: "授業記録の構造分析と可視化ツール",
    },
    en: {
      features: "Features",
      startAnalysis: "Start Analysis",
      heroTitle: "Visualize Classroom Structure with AI",
      heroDescription: "Leverage Gemini AI to analyze utterance relationships, topic structure, and hidden influencers from classroom records, understanding lessons from both qualitative and quantitative perspectives.",
      feature1Title: "Relation Network",
      feature1Desc: "Visualize agreement, disagreement, additions",
      feature2Title: "Quantitative Analysis",
      feature2Desc: "Centrality metrics, sentiment scores, stats",
      feature3Title: "Timeline",
      feature3Desc: "Chronological view with coding",
      feature4Title: "Hidden Influencers",
      feature4Desc: "Detect key speakers who led discussion",
      footerPowered: "Powered by Gemini AI",
      footerDesc: "Classroom discourse analysis and visualization tool",
    }
  }
  
  const t = content[language]

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {language === "ja" ? "授業談話分析ツール" : "Classroom Discourse Analyzer"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {language === "ja" ? "Classroom Discourse Analyzer" : "AI-powered Analysis Tool"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6 text-sm">
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t.features}
                </a>
                <a href="#analysis" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t.startAnalysis}
                </a>
              </nav>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance leading-tight">
              {t.heroTitle}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              {t.heroDescription}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10 max-w-4xl mx-auto" id="features">
            <div className="p-4 bg-card rounded-lg border border-border/60 text-center">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <Network className="w-5 h-5 text-primary" />
              </div>
              <h3 className="mt-3 font-medium text-foreground text-sm">{t.feature1Title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{t.feature1Desc}</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/60 text-center">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto">
                <BarChart3 className="w-5 h-5 text-accent" />
              </div>
              <h3 className="mt-3 font-medium text-foreground text-sm">{t.feature2Title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{t.feature2Desc}</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/60 text-center">
              <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center mx-auto">
                <Clock className="w-5 h-5 text-chart-3" />
              </div>
              <h3 className="mt-3 font-medium text-foreground text-sm">{t.feature3Title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{t.feature3Desc}</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border/60 text-center">
              <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center mx-auto">
                <BookOpen className="w-5 h-5 text-chart-4" />
              </div>
              <h3 className="mt-3 font-medium text-foreground text-sm">{t.feature4Title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{t.feature4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Analysis Section */}
      <section className="py-12 md:py-16" id="analysis">
        <div className="container mx-auto px-4">
          <AnalysisDashboard />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>{t.footerPowered}</p>
            <p>{t.footerDesc}</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  )
}
