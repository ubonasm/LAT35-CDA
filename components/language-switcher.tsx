"use client"

import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
      <Globe className="w-4 h-4 text-muted-foreground ml-2" />
      <Button
        variant={language === "ja" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setLanguage("ja")}
        className="h-7 px-2 text-xs font-medium"
      >
        日本語
      </Button>
      <Button
        variant={language === "en" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setLanguage("en")}
        className="h-7 px-2 text-xs font-medium"
      >
        English
      </Button>
    </div>
  )
}
