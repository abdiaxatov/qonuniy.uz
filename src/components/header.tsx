"use client"
import { cn } from "@/lib/utils"
import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect, useCallback } from "react"
import { Search, X } from "lucide-react"
import { Globe } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

// Update the header component to use the language provider
import { useLanguage } from "@/components/language-provider"

export default function Header() {
  // Use the language context
  const { currentLanguage, setLanguage, languages } = useLanguage()

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const langMenuRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize search query from URL
  useEffect(() => {
    const query = searchParams.get("search")
    if (query) {
      setSearchQuery(query)
    }
  }, [searchParams])

  const handleLanguageChange = (lang: (typeof languages)[0]) => {
    setLanguage(lang)
    setIsLangMenuOpen(false)
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
    // Focus the search input when opened
    if (!isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 300) // Wait for animation to complete
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    // Get the current path (/ or /project)
    const pathname = window.location.pathname
    const basePath = pathname === "/" || pathname === "" ? "/" : pathname

    // Perform search in real-time
    if (value.trim()) {
      // Keep language parameter if it exists
      const params = new URLSearchParams()
      params.set("search", value.trim())

      if (currentLanguage.code !== "uzb") {
        params.set("lang", currentLanguage.code)
      }

      router.push(`${basePath}?${params.toString()}`)
    } else {
      // If search is cleared, go back to current page or current language filter
      if (currentLanguage.code !== "uzb") {
        router.push(`${basePath}?lang=${currentLanguage.code}`)
      } else {
        router.push(basePath)
      }
    }
  }

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (!langMenuRef.current?.contains(event.target as Node)) {
      setIsLangMenuOpen(false)
    }
  }, [])

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
    <div className="h-full">
      {/* Mobile Search Overlay */}
      <div
        className={cn(
          "fixed top-0 left-0 w-full bg-background shadow-md z-[60] transform transition-transform duration-300 ease-in-out",
          isSearchOpen ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <div className="flex items-center p-4">
          <Search className="h-5 w-5 text-gray-500 mr-2" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Qidirish..."
            className="flex-1 py-2 focus:outline-none focus:ring-0 bg-transparent"
            autoComplete="off"
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
          <button
            type="button"
            onClick={toggleSearch}
            className="ml-2 p-2 text-gray-500 hover:text-gray-700"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="fixed top-0 md:pt-12 md:pb-9 pt-9 pb-9 inset-x-0 h-16 w-full bg-background to-transparent backdrop-blur-lg dark:bg-background flex items-center justify-between px-4 md:px-20 py-4 z-50">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" passHref>
            <Image src="/Qonuniy.svg" alt="Logo" width={65} height={65} className="md:w-20 md:h-20" />
          </Link>
          <span className="ml-2 text-2xl font-bold text-[#0099b5]">qonuniy.uz</span>
        </div>

        {/* Search and Language Selector */}
        <div className="flex items-center space-x-4">
          {/* Search - Mobile Version */}
          <div className="md:hidden">
            <button
              onClick={toggleSearch}
              className="p-2 border rounded-md transition-all duration-300 ease-in-out"
              aria-label="Open search"
            >
              <Search className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Search - Desktop Version */}
          <div className="hidden md:flex items-center relative border rounded-md">
            <Search className="h-5 w-5 text-gray-500 ml-2" />
            <input
              type="text"
              placeholder="Qidirish..."
              className="pl-2 pr-3 py-2 focus:outline-none focus:ring-0"
              value={searchQuery}
              onChange={handleSearchInputChange}
            />
          </div>

          {/* Language Selector */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center px-3 py-2 border rounded-md transition focus:outline-none focus:ring-2 focus:ring-[#0099b5]"
              aria-label="Select language"
            >
              <Globe className="h-5 w-5 mr-1" />
              <span className="hidden md:inline">{currentLanguage.fullName}</span>
              <span className="md:hidden">{currentLanguage.abbr}</span>
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-auto min-w-[120px] bg-white border rounded-md shadow-lg z-10 transition-opacity duration-300">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang)}
                    className={cn(
                      "block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition",
                      currentLanguage.code === lang.code ? "font-bold" : "",
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

