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
    allProjects: "Barcha loyihalar",
    searchResults: "qidiruv natijalari",
    otherSearchResults: "Boshqa qidiruv natijalari",
    otherProjects: "Boshqa loyihalar",
    noProjectsInLanguage: "Tanlangan tilda loyihalar hozircha mavjud emas. Barcha mavjud loyihalar ko`rsatilmoqda.",
    noResultsFound: "Natija topilmadi",
    noProjectsForSearch: "so'rovi bo'yicha hech qanday loyiha topilmadi.",
    noProjectsAvailable: "Hech qanday loyiha mavjud emas.",
    information: "Ma`lumot",
    readMore: "Batafsil o`qish",
    author: "Muallif",
    dateNotSpecified: "Sana ko`rsatilmagan",
    views: "ko`rishlar",
    results: "ta natija",
    uzbekProjects: "O'zbekcha loyihalar",
    russianProjects: "Ruscha loyihalar",
    englishProjects: "Inglizcha loyihalar",
    uzbekCyrProjects: "Ўзбекча лойиҳалар",
    uzbek: "O'zbekcha",
    russian: "Ruscha",
    english: "Inglizcha",
    uzbekCyr: "Ўзбекча",
  },
  rus: {
    allProjects: "Все проекты",
    searchResults: "результаты поиска",
    otherSearchResults: "Другие результаты поиска",
    otherProjects: "Другие проекты",
    noProjectsInLanguage: "Проекты на выбранном языке пока недоступны. Показаны все доступные проекты.",
    noResultsFound: "Результатов не найдено",
    noProjectsForSearch: "По вашему запросу не найдено проектов.",
    noProjectsAvailable: "Нет доступных проектов.",
    information: "Информация",
    readMore: "Читать подробнее",
    author: "Автор",
    dateNotSpecified: "Дата не указана",
    views: "просмотров",
    results: "результатов",
    uzbekProjects: "Проекты на узбекском",
    russianProjects: "Проекты на русском",
    englishProjects: "Проекты на английском",
    uzbekCyrProjects: "Проекты на узбекском (кириллица)",
    uzbek: "Узбекский",
    russian: "Русский",
    english: "Английский",
    uzbekCyr: "Узбекский (кир.)",
  },
  eng: {
    allProjects: "All Projects",
    searchResults: "search results",
    otherSearchResults: "Other search results",
    otherProjects: "Other projects",
    noProjectsInLanguage: "Projects in the selected language are not available yet. Showing all available projects.",
    noResultsFound: "No results found",
    noProjectsForSearch: "No projects found for your search query.",
    noProjectsAvailable: "No projects available.",
    information: "Information",
    readMore: "Read more",
    author: "Author",
    dateNotSpecified: "Date not specified",
    views: "views",
    results: "results",
    uzbekProjects: "Uzbek projects",
    russianProjects: "Russian projects",
    englishProjects: "English projects",
    uzbekCyrProjects: "Uzbek projects (Cyrillic)",
    uzbek: "Uzbek",
    russian: "Russian",
    english: "English",
    uzbekCyr: "Uzbek (Cyr.)",
  },
  uzb_cyr: {
    allProjects: "Барча лойиҳалар",
    searchResults: "қидирув натижалари",
    otherSearchResults: "Бошқа қидирув натижалари",
    otherProjects: "Бошқа лойиҳалар",
    noProjectsInLanguage: "Танланган тилда лойиҳалар ҳозирча мавжуд эмас. Барча мавжуд лойиҳалар кўрсатилмоқда.",
    noResultsFound: "Натижа топилмади",
    noProjectsForSearch: "сўрови бўйича ҳеч қандай лойиҳа топилмади.",
    noProjectsAvailable: "Ҳеч қандай лойиҳа мавжуд эмас.",
    information: "Маълумот",
    readMore: "Батафсил ўқиш",
    author: "Муаллиф",
    dateNotSpecified: "Сана кўрсатилмаган",
    views: "кўришлар",
    results: "та натижа",
    uzbekProjects: "Ўзбекча лойиҳалар",
    russianProjects: "Русча лойиҳалар",
    englishProjects: "Инглизча лойиҳалар",
    uzbekCyrProjects: "Ўзбекча лойиҳалар",
    uzbek: "Ўзбекча",
    russian: "Русча",
    english: "Инглизча",
    uzbekCyr: "Ўзбекча",
  },
}

export default function Project() {
  const [projects, setProjects] = useState<any[]>([])
  const [filteredProjects, setFilteredProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasLanguageProjects, setHasLanguageProjects] = useState(true)
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("search")
  const langFilter = searchParams.get("lang")
  const { currentLanguage } = useLanguage()
  const router = useRouter()

  // Get translations for current language
  const t = translations[currentLanguage.code as keyof typeof translations] || translations.uzb

  useEffect(() => {
    const projectsRef = collection(db, "Projects")

    try {
      const unsubscribe = onSnapshot(projectsRef, (snapshot) => {
        const projectsData: any[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Sort by date (newest first)
        projectsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setProjects(projectsData)
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error("Error fetching projects:", error)
      setLoading(false)
    }
  }, [])

  // Filter projects based on search query or language
  useEffect(() => {
    if (projects.length === 0) return

    let filtered = [...projects]
    const languageToFilter = langFilter || currentLanguage.code

    // Get all possible language codes for the selected language
    const possibleLanguageCodes = LANGUAGE_CODES[languageToFilter as keyof typeof LANGUAGE_CODES] || [languageToFilter]

    // Check if there are any projects in the selected language
    const hasProjectsInLanguage = projects.some((project) => possibleLanguageCodes.includes(project.language))

    setHasLanguageProjects(hasProjectsInLanguage)

    // If there are projects in the selected language, filter by that language
    if (hasProjectsInLanguage) {
      filtered = filtered.filter((project) => possibleLanguageCodes.includes(project.language))
    } else {
      // If no projects in the selected language, show all projects
      console.log(`No projects found in language: ${languageToFilter}`)
    }

    // Apply search filter if search query exists
    if (searchQuery) {
      filtered = filtered.filter((project) => project.title.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    setFilteredProjects(filtered)
  }, [projects, searchQuery, langFilter, currentLanguage.code])

  // Add useEffect to redirect to saved language on initial load if no filters are applied
  useEffect(() => {
    if (!searchQuery && !langFilter && typeof window !== "undefined") {
      const savedLang = localStorage.getItem("selectedLanguage")
      if (savedLang && savedLang !== "uzb") {
        router.push(`/project?lang=${savedLang}`)
      }
    }
  }, [searchQuery, langFilter, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <Image src="/Qonuniy.svg" alt="Qonuniy logo" width={200} height={100} />
      </div>
    )
  }

  // If no projects in the selected language, show a message but don't filter
  // This ensures we always show some content
  const displayProjects = hasLanguageProjects ? filteredProjects : projects

  const featuredProject = displayProjects.length > 0 ? displayProjects[0] : null
  const otherProjects = displayProjects.length > 1 ? displayProjects.slice(1) : []

  // Determine the page title based on filters
  const getPageTitle = () => {
    if (searchQuery) {
      return `"${searchQuery}" ${t.searchResults}`
    } else if (langFilter) {
      const langName =
        {
          uzb: t.uzbekProjects,
          rus: t.russianProjects,
          eng: t.englishProjects,
          uzb_cyr: t.uzbekCyrProjects,
        }[langFilter] || langFilter

      return `${langName}`
    }
    return t.allProjects
  }

  return (
    <main className="min-h-screen bg-background mb-12">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 border-b pb-4">
          {getPageTitle()}
          {(searchQuery || langFilter) && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({displayProjects.length} {t.results})
            </span>
          )}
        </h1>

        {!hasLanguageProjects && langFilter && (
          <Alert variant="info" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t.information}</AlertTitle>
            <AlertDescription>{t.noProjectsInLanguage}</AlertDescription>
          </Alert>
        )}

        {displayProjects.length === 0 ? (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t.noResultsFound}</AlertTitle>
            <AlertDescription>
              {searchQuery ? `"${searchQuery}" ${t.noProjectsForSearch}` : t.noProjectsAvailable}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {featuredProject && <FeaturedProject project={featuredProject} />}

            {otherProjects.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">
                  {searchQuery ? t.otherSearchResults : t.otherProjects}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
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

function FeaturedProject({ project }: { project: any }) {
  const [hasTrackedView, setHasTrackedView] = useState(false)
  const { currentLanguage } = useLanguage()

  // Get translations for current language
  const t = translations[currentLanguage.code as keyof typeof translations] || translations.uzb

  useEffect(() => {
    const trackView = async () => {
      if (!hasTrackedView) {
        const viewedProjects = JSON.parse(localStorage.getItem("viewedProjects") || "{}")

        if (!viewedProjects[project.id]) {
          const projectRef = doc(db, "Projects", project.id)
          await updateDoc(projectRef, {
            views: increment(1),
          })

          viewedProjects[project.id] = true
          localStorage.setItem("viewedProjects", JSON.stringify(viewedProjects))
          setHasTrackedView(true)
        }
      }
    }

    trackView()
  }, [project.id, hasTrackedView])

  // Truncate content to 300 characters and add ellipsis if needed
  const truncateContent = (content: string) => {
    if (!content) return ""
    if (content.length <= 300) return content
    return content.substring(0, 300) + "..."
  }

  const getMediaContent = () => {
    if (project.videoUrl && project.videoUrl.includes("youtube")) {
      const videoId = project.videoUrl.split("v=")[1]?.split("&")[0] || ""
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            title={project.title}
          />
        </div>
      )
    } else if (project.imageUrl) {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image src={project.imageUrl || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
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
    <Link href={`/project/${project.id}`} className="block group">
      <Card className="border-none shadow-none hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="order-2 md:order-1 flex flex-col justify-center p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs">
                  {project.author || t.author}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {project.date ? formatDistanceToNow(parseISO(project.date), { addSuffix: true }) : t.dateNotSpecified}
                </span>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="ml-2">
                    {project.views || 0} {t.views}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                {project.language && (
                  <Badge variant="secondary" className="text-xs">
                    {getLanguageDisplay(project.language)}
                  </Badge>
                )}
              </div>
              <h2 className="text-3xl font-bold mb-4 group-hover:text-[#0099b5] text-primary transition-colors">
                {project.title}
              </h2>
              <div
                className="text-muted-foreground text-sm mb-2"
                dangerouslySetInnerHTML={{ __html: truncateContent(project.content) }}
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

function ProjectCard({ project }: { project: any }) {
  const [hasTrackedView, setHasTrackedView] = useState(false)
  const { currentLanguage } = useLanguage()

  // Get translations for current language
  const t = translations[currentLanguage.code as keyof typeof translations] || translations.uzb

  useEffect(() => {
    const trackView = async () => {
      if (!hasTrackedView) {
        const viewedProjects = JSON.parse(localStorage.getItem("viewedProjects") || "{}")

        if (!viewedProjects[project.id]) {
          const projectRef = doc(db, "Projects", project.id)
          await updateDoc(projectRef, {
            views: increment(1),
          })

          viewedProjects[project.id] = true
          localStorage.setItem("viewedProjects", JSON.stringify(viewedProjects))
          setHasTrackedView(true)
        }
      }
    }

    trackView()
  }, [project.id, hasTrackedView])

  // Truncate content to 300 characters and add ellipsis if needed
  const truncateContent = (content: string) => {
    if (!content) return ""
    if (content.length <= 300) return content
    return content.substring(0, 300) + "..."
  }

  const getMediaContent = () => {
    if (project.videoUrl && project.videoUrl.includes("youtube")) {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg group-hover:opacity-90 transition-opacity">
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-primary/80 rounded-full p-2">
              <Play className="h-6 w-6 text-white" />
            </div>
          </div>
          <Image
            src={project.imageUrl || "/placeholder.svg?height=400&width=600"}
            alt={project.title}
            fill
            className="object-cover"
          />
        </div>
      )
    } else if (project.imageUrl) {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg group-hover:opacity-90 transition-opacity">
          <Image src={project.imageUrl || "/placeholder.svg"} alt={project.title} fill className="object-cover" />
        </div>
      )
    } else {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted group-hover:opacity-90 transition-opacity">
          <Image src="/placeholder.svg?height=400&width=600" alt="Placeholder" fill className="object-cover" />
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
    <Link href={`/project/${project.id}`} className="block group">
      <Card className="border-none shadow-none hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="space-y-3">
            {getMediaContent()}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {project.author || t.author}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {project.date ? formatDistanceToNow(parseISO(project.date), { addSuffix: true }) : t.dateNotSpecified}
                </span>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="ml-2">
                    {project.views || 0} {t.views}
                  </span>
                </div>
              </div>
              {project.language && (
                <div className="mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {getLanguageDisplay(project.language)}
                  </Badge>
                </div>
              )}
              <h3 className="font-semibold text-lg mb-2 group-hover:text-[#0099b5] text-primary transition-colors line-clamp-2">
                {project.title}
              </h3>
              <div
                className="text-muted-foreground text-sm mb-2"
                dangerouslySetInnerHTML={{ __html: truncateContent(project.content) }}
              />
              <div className="text-primary text-sm font-medium group-hover:underline">{t.readMore}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

