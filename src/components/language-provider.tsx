"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

type Language = {
  code: string
  fullName: string
  abbr: string
}

type LanguageContextType = {
  currentLanguage: Language
  setLanguage: (lang: Language) => void
  languages: Language[]
}

const languages: Language[] = [
  { code: "uzb", fullName: "O'zbekiston", abbr: "UZB" },
  { code: "rus", fullName: "Русский", abbr: "РУС" },
  { code: "eng", fullName: "English", abbr: "ENG" },
  { code: "uzb_cyr", fullName: "Ўзбекистон", abbr: "ЎЗБ" },
]

// Language code mapping for compatibility with different formats
const LANGUAGE_CODE_MAP: Record<string, string> = {
  uz: "uzb",
  ru: "rus",
  en: "eng",
  uz_cyr: "uzb_cyr",
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize with default language (Uzbek Latin)
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // Default to Uzbek
    return languages[0]
  })

  // Load saved language from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("selectedLanguage")
      if (savedLang) {
        const found = languages.find((lang) => lang.code === savedLang)
        if (found) {
          setCurrentLanguage(found)
        }
      }
    }
  }, [])

  // Update language when URL param changes
  useEffect(() => {
    const langParam = searchParams.get("lang")
    if (langParam) {
      // Map short language codes to our format if needed
      const normalizedLangCode = LANGUAGE_CODE_MAP[langParam] || langParam

      const found = languages.find((lang) => lang.code === normalizedLangCode)
      if (found && found.code !== currentLanguage.code) {
        setCurrentLanguage(found)
        localStorage.setItem("selectedLanguage", found.code)
      }
    }
  }, [searchParams, currentLanguage.code])

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang)
    localStorage.setItem("selectedLanguage", lang.code)

    // Update URL with language parameter
    const params = new URLSearchParams(searchParams.toString())
    params.set("lang", lang.code)

    // Keep search parameter if it exists
    const searchQuery = searchParams.get("search")
    if (searchQuery) {
      params.set("search", searchQuery)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, languages }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

