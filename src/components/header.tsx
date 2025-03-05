"use client"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useCallback } from "react"
import { Search, X } from "lucide-react"
import { Globe } from "lucide-react"

export default function Header() {
  // Language options with full names and abbreviations
  const languages = [
    { code: "uzb", fullName: "O'zbekiston", abbr: "UZB" },
    { code: "rus", fullName: "Русский", abbr: "РУС" },
    { code: "eng", fullName: "English", abbr: "ENG" },
    { code: "uzb_cyr", fullName: "Ўзбекистон", abbr: "ЎЗБ" },
  ]

  const [selectedLang, setSelectedLang] = useState(languages[0]) // Default language
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const langMenuRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const handleLanguageChange = (lang: (typeof languages)[0]) => {
    setSelectedLang(lang)
    setIsLangMenuOpen(false)
    // Add your logic to handle language change here
  }

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (!langMenuRef.current?.contains(event.target as Node)) {
      setIsLangMenuOpen(false)
    }
  }, [])

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
    // Focus the search input when opened
    if (!isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }

  useEffect(() => {
    if (isLangMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isLangMenuOpen, handleClickOutside])

  return (
    <div className="h-full ">
      <div className="fixed top-0 md:pt-12 md:pb-9 pt-9 pb-9 inset-x-0 h-16 w-full bg-background to-transparent backdrop-blur-lg dark:bg-background flex items-center justify-between px-4 md:px-20 py-4 z-50">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" passHref>
            <Image src="/Qonuniy.svg" alt="Logo" width={65} height={65} className="md:w-20 md:h-20" />
          </Link>
        </div>

        {/* Search and Language Selector */}
        <div className="flex items-center space-x-4">
          {/* Search - Mobile Version */}
          <div className="relative md:hidden">
            {!isSearchOpen ? (
              <button
                onClick={toggleSearch}
                className="p-2 border rounded-md transition-all duration-300 ease-in-out"
                aria-label="Open search"
              >
                <Search className="h-5 w-5 text-gray-500" />
              </button>
            ) : (
              <div className="flex items-center border rounded-md bg-background">
                <Search className="h-5 w-5 text-gray-500 ml-2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  className="pl-2 pr-8 py-2 w-[150px] focus:outline-none focus:ring-0"
                />
                <button onClick={toggleSearch} className="absolute right-2 text-gray-500" aria-label="Close search">
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Search - Desktop Version */}
          <div className="hidden md:flex items-center relative border rounded-md">
            <Search className="h-5 w-5 text-gray-500 ml-2" />
            <input type="text" placeholder="Search..." className="pl-2 pr-3 py-2 focus:outline-none focus:ring-0" />
          </div>

          {/* Language Selector */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center px-3 py-2 border rounded-md transition focus:outline-none focus:ring-2 focus:ring-[#0099b5]"
              aria-label="Select language"
            >
              <Globe className="h-5 w-5 mr-1" />
              <span className="hidden md:inline">{selectedLang.fullName}</span>
              <span className="md:hidden">{selectedLang.abbr}</span>
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-auto min-w-[120px] bg-white border rounded-md shadow-lg z-10 transition-opacity duration-300">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang)}
                    className={cn(
                      "block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition",
                      selectedLang.code === lang.code ? "font-bold" : "",
                    )}
                  >
                    <span className="hidden md:inline">{lang.fullName}</span>
                    <span className="md:hidden">{lang.abbr}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

