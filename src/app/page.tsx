"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { parseISO } from "date-fns/parseISO"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { Play, AlertCircle, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { collection, onSnapshot, doc, updateDoc, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useSearchParams, useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-provider"

// Language code mapping
const LANGUAGE_CODES = {
  uzb: ["uzb", "uz"],
  rus: ["rus", "ru"],
  eng: ["eng", "en"],
  uzb_cyr: ["uzb_cyr", "uz_cyr"],
}

// Translations for static text
const translations = {
  uzb: {
    latestNews: "So`ngi yangiliklar",
    searchResults: "qidiruv natijalari",
    otherSearchResults: "Boshqa qidiruv natijalari",
    otherArticles: "Boshqa yangiliklar",
    otherNews: "Boshqa yangiliklar",
    noArticlesInLanguage: "Tanlangan tilda maqolalar hozircha mavjud emas. Barcha mavjud maqolalar ko`rsatilmoqda.",
    noResultsFound: "Natija topilmadi",
    noArticlesForSearch: "so'rovi bo'yicha hech qanday maqola topilmadi.",
    noArticlesAvailable: "Hech qanday maqola mavjud emas.",
    information: "Ma`lumot",
    readMore: "Batafsil o`qish",
    author: "Muallif",
    dateNotSpecified: "Sana ko`rsatilmagan",
    views: "ko`rishlar",
    cards: "natija topildi",
    uzbekNews: "O'zbekcha yangiliklar",
    russianNews: "Ruscha yangiliklar",
    englishNews: "Inglizcha yangiliklar",
    uzbekCyrNews: "янгиликлар",
    uzbek: "O'zbekcha",
    russian: "Ruscha",
    english: "Inglizcha",
    uzbekCyr: "Ўзбекча",
  },
  rus: {
    latestNews: "Последние новости",
    searchResults: "результаты поиска",
    otherSearchResults: "Другие результаты поиска",
    otherArticles: "Другие новости",
    otherNews: "Другие новости",
    noArticlesInLanguage: "Статьи на выбранном языке пока недоступны. Показаны все доступные статьи.",
    noResultsFound: "Результатов не найдено",
    noArticlesForSearch: "По вашему запросу не найдено статей.",
    noArticlesAvailable: "Нет доступных статей.",
    information: "Информация",
    readMore: "Читать подробнее",
    author: "Автор",
    dateNotSpecified: "Дата не указана",
    views: "просмотров",
    cards: "результат найден",
    uzbekNews: "Новости на узбекском",
    russianNews: "последние новости",
    englishNews: "Новости на английском",
    uzbekCyrNews: "последние новости",
    uzbek: "Узбекский",
    russian: "Русский",
    english: "Английский",
    uzbekCyr: "Узбекский (кир.)",
  },
  eng: {
    latestNews: "Latest News",
    searchResults: "search results",
    otherSearchResults: "Other search results",
    otherArticles: "Other news",
    otherNews: "Other news",
    noArticlesInLanguage: "Articles in the selected language are not available yet. Showing all available articles.",
    noResultsFound: "No results found",
    noArticlesForSearch: "No articles found for your search query.",
    noArticlesAvailable: "No articles available.",
    information: "Information",
    readMore: "Read more",
    author: "Author",
    dateNotSpecified: "Date not specified",
    views: "views",
    cards: "result found",
    uzbekNews: "Uzbek news",
    russianNews: "Russian news",
    englishNews: "Latest news",
    uzbekCyrNews: " news (Cyrillic)",
    uzbek: "Uzbek",
    russian: "Russian",
    english: "English",
    uzbekCyr: "Uzbek (Cyr.)",
  },
  uzb_cyr: {
    latestNews: "Сўнги янгиликлар",
    searchResults: "қидирув натижалари",
    otherSearchResults: "Бошқа қидирув натижалари",
    otherArticles: "Бошқа янгиликлар",
    otherNews: "Бошқа янгиликлар",
    noArticlesInLanguage: "Танланган тилда мақолалар ҳозирча мавжуд эмас. Барча мавжуд мақолалар кўрсатилмоқда.",
    noResultsFound: "Натижа топилмади",
    noArticlesForSearch: "сўрови бўйича ҳеч қандай мақола топилмади.",
    noArticlesAvailable: "Ҳеч қандай мақола мавжуд эмас.",
    information: "Маълумот",
    readMore: "Батафсил ўқиш",
    author: "Муаллиф",
    dateNotSpecified: "Сана кўрсатилмаган",
    views: "кўришлар",
    cards: "натижа топилди",
    uzbekNews: "Ўзбекча янгиликлар",
    russianNews: "Русча янгиликлар",
    englishNews: "Инглизча янгиликлар",
    uzbekCyrNews: " Сўнги янгиликлар",
    uzbek: "Ўзбекча",
    russian: "Русча",
    english: "Инглизча",
    uzbekCyr: "Ўзбекча",
  },
}

export default function Home() {
  const [articles, setArticles] = useState<any[]>([])
  const [filteredArticles, setFilteredArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasLanguageArticles, setHasLanguageArticles] = useState(true)
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("search")
  const langFilter = searchParams.get("lang")
  const { currentLanguage } = useLanguage()
  const router = useRouter()

  // Get translations for current language
  const t = translations[currentLanguage.code as keyof typeof translations] || translations.uzb

  useEffect(() => {
    const articlesRef = collection(db, "blogs")

    try {
      const unsubscribe = onSnapshot(articlesRef, (snapshot) => {
        const articlesData: any[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Sort by date (newest first)
        articlesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setArticles(articlesData)
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error("Error fetching articles:", error)
      setLoading(false)
    }
  }, [])

  // Filter articles based on search query or language
  useEffect(() => {
    if (articles.length === 0) return

    let filtered = [...articles]
    const languageToFilter = langFilter || currentLanguage.code

    // Get all possible language codes for the selected language
    const possibleLanguageCodes = LANGUAGE_CODES[languageToFilter as keyof typeof LANGUAGE_CODES] || [languageToFilter]

    // Check if there are any articles in the selected language
    const hasArticlesInLanguage = articles.some((article) => possibleLanguageCodes.includes(article.language))

    setHasLanguageArticles(hasArticlesInLanguage)

    // If there are articles in the selected language, filter by that language
    if (hasArticlesInLanguage) {
      filtered = filtered.filter((article) => possibleLanguageCodes.includes(article.language))
    } else {
      // If no articles in the selected language, show all articles
      console.log(`No articles found in language: ${languageToFilter}`)
    }

    // Apply search filter if search query exists
    if (searchQuery) {
      filtered = filtered.filter((article) => article.title.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    setFilteredArticles(filtered)
  }, [articles, searchQuery, langFilter, currentLanguage.code])

  // Add useEffect to redirect to saved language on initial load if no filters are applied
  useEffect(() => {
    if (!searchQuery && !langFilter && typeof window !== "undefined") {
      const savedLang = localStorage.getItem("selectedLanguage")
      if (savedLang && savedLang !== "uzb") {
        router.push(`/?lang=${savedLang}`)
      }
    }
  }, [searchQuery, langFilter, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        {/* <img src="/Qonuniy.svg" alt="Qonuniy logo" width={200} height={100} /> */}
      </div>
    )
  }

  // If no articles in the selected language, show a message but don't filter
  // This ensures we always show some content
  const displayArticles = hasLanguageArticles ? filteredArticles : articles

  const featuredArticle = displayArticles.length > 0 ? displayArticles[0] : null
  const otherArticles = displayArticles.length > 1 ? displayArticles.slice(1) : []

  // Determine the page title based on filters
  const getPageTitle = () => {
    if (searchQuery) {
      return `"${searchQuery}" ${t.searchResults}`
    } else if (langFilter) {
      const langName =
        {
          uzb: t.uzbekNews,
          rus: t.russianNews,
          eng: t.englishNews,
          uzb_cyr: t.uzbekCyrNews,
        }[langFilter] || langFilter

      return `${langName}`
    }
    return t.latestNews
  }

  return (
    <main className="min-h-screen bg-background mb-12">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 border-b pb-4">
          {getPageTitle()}
          {(searchQuery || langFilter) && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {displayArticles.length} {t.cards}
            </span>
          )}
        </h1>

        {!hasLanguageArticles && langFilter && (
          <Alert variant="info" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t.information}</AlertTitle>
            <AlertDescription>{t.noArticlesInLanguage}</AlertDescription>
          </Alert>
        )}

        {displayArticles.length === 0 ? (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t.noResultsFound}</AlertTitle>
            <AlertDescription>
              {searchQuery ? `"${searchQuery}" ${t.noArticlesForSearch}` : t.noArticlesAvailable}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {featuredArticle && <FeaturedArticle article={featuredArticle} />}

            {otherArticles.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">
                  {searchQuery ? t.otherSearchResults : langFilter ? t.otherArticles : t.otherNews}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

function FeaturedArticle({ article }: { article: any }) {
  const [hasTrackedView, setHasTrackedView] = useState(false)
  const { currentLanguage } = useLanguage()

  // Get translations for current language
  const t = translations[currentLanguage.code as keyof typeof translations] || translations.uzb

  useEffect(() => {
    const trackView = async () => {
      if (!hasTrackedView) {
        const viewedArticles = JSON.parse(localStorage.getItem("viewedArticles") || "{}")

        if (!viewedArticles[article.id]) {
          const articleRef = doc(db, "blogs", article.id)
          await updateDoc(articleRef, {
            views: increment(1),
          })

          viewedArticles[article.id] = true
          localStorage.setItem("viewedArticles", JSON.stringify(viewedArticles))
          setHasTrackedView(true)
        }
      }
    }

    trackView()
  }, [article.id, hasTrackedView])

  // Truncate content to 300 characters and add ellipsis if needed
  const truncateContent = (content: string) => {
    if (!content) return ""
    if (content.length <= 300) return content
    return content.substring(0, 300) + "..."
  }

  const getMediaContent = () => {
    if (article.videoUrl && article.videoUrl.includes("youtube")) {
      const videoId = article.videoUrl.split("v=")[1]?.split("&")[0] || ""
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            title={article.title}
          />
        </div>
      )
    } else if (article.imageUrl) {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image src={article.imageUrl || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
        </div>
      )
    } else {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <Image src="/placeholder.svg?height=600&width=1200" alt="Placeholder" fill className="object-cover" />
        </div>
      )
    }
  }

  // Get language display name
  const getLanguageDisplay = (langCode: string) => {
    if (!langCode) return ""

    if (langCode === "uzb" || langCode === "uz") return t.uzbek
    if (langCode === "rus" || langCode === "ru") return t.russian
    if (langCode === "eng" || langCode === "en") return t.english
    if (langCode === "uzb_cyr" || langCode === "uz_cyr") return t.uzbekCyr

    return langCode
  }

  return (
    <Link href={`/article/${article.id}`} className="block group">
      <Card className="border-none shadow-none hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="order-2 md:order-1 flex flex-col justify-center p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs">
                  {article.author || t.author}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {article.date ? formatDistanceToNow(parseISO(article.date), { addSuffix: true }) : t.dateNotSpecified}
                </span>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="ml-2">
                    {article.views || 0} {t.views}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                {article.language && (
                  <Badge variant="secondary" className="text-xs">
                    {getLanguageDisplay(article.language)}
                  </Badge>
                )}
              </div>
              <h2 className="text-3xl font-bold mb-4 group-hover:text-[#0099b5] text-primary transition-colors">
                {article.title}
              </h2>
              <div
                className="text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: truncateContent(article.content) }}
              />
              <div className="mt-4 inline-flex">
                <span className="text-primary font-medium group-hover:underline">{t.readMore}</span>
              </div>
            </div>
            <div className="order-1 md:order-2">{getMediaContent()}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function ArticleCard({ article }: { article: any }) {
  const [hasTrackedView, setHasTrackedView] = useState(false)
  const { currentLanguage } = useLanguage()

  // Get translations for current language
  const t = translations[currentLanguage.code as keyof typeof translations] || translations.uzb

  useEffect(() => {
    const trackView = async () => {
      if (!hasTrackedView) {
        const viewedArticles = JSON.parse(localStorage.getItem("viewedArticles") || "{}")

        if (!viewedArticles[article.id]) {
          const articleRef = doc(db, "blogs", article.id)
          await updateDoc(articleRef, {
            views: increment(1),
          })

          viewedArticles[article.id] = true
          localStorage.setItem("viewedArticles", JSON.stringify(viewedArticles))
          setHasTrackedView(true)
        }
      }
    }

    trackView()
  }, [article.id, hasTrackedView])

  // Truncate content to 300 characters and add ellipsis if needed
  const truncateContent = (content: string) => {
    if (!content) return ""
    if (content.length <= 300) return content
    return content.substring(0, 300) + "..."
  }

  const getMediaContent = () => {
    if (article.videoUrl && article.videoUrl.includes("youtube")) {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg group-hover:opacity-90 transition-opacity">
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-primary/80 rounded-full p-2">
              <Play className="h-6 w-6 text-white" />
            </div>
          </div>
          <img
            src={article.imageUrl || "/placeholder.svg?height=400&width=600"}
            alt={article.title}
            className="object-cover"
          />
        </div>
      )
    } else if (article.imageUrl) {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg group-hover:opacity-90 transition-opacity">
          <img src={article.imageUrl || "/placeholder.svg"} alt={article.title} className="object-cover" />
        </div>
      )
    } else {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted group-hover:opacity-90 transition-opacity">
          <img src="/placeholder.svg?height=400&width=600" alt="Placeholder" className="object-cover" />
        </div>
      )
    }
  }

  // Get language display name
  const getLanguageDisplay = (langCode: string) => {
    if (!langCode) return ""

    if (langCode === "uzb" || langCode === "uz") return t.uzbek
    if (langCode === "rus" || langCode === "ru") return t.russian
    if (langCode === "eng" || langCode === "en") return t.english
    if (langCode === "uzb_cyr" || langCode === "uz_cyr") return t.uzbekCyr

    return langCode
  }

  return (
    <Link href={`/article/${article.id}`} className="block group">
      <Card className="border-none shadow-none hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="space-y-3">
            {getMediaContent()}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {article.author || t.author}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {article.date ? formatDistanceToNow(parseISO(article.date), { addSuffix: true }) : t.dateNotSpecified}
                </span>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="ml-2">
                    {article.views || 0} {t.views}
                  </span>
                </div>
              </div>
              {article.language && (
                <div className="mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {getLanguageDisplay(article.language)}
                  </Badge>
                </div>
              )}
              <h3 className="font-semibold text-lg mb-2 group-hover:text-[#0099b5] text-primary transition-colors line-clamp-2">
                {article.title}
              </h3>
              <div
                className="text-muted-foreground text-sm mb-2"
                dangerouslySetInnerHTML={{ __html: truncateContent(article.content) }}
              />

              <div className="text-primary text-sm font-medium group-hover:underline">{t.readMore}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

