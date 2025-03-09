"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { parseISO } from "date-fns/parseISO"
import { ArrowLeft, Calendar, Clock, Eye, Share2, AlertCircle } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselIndicators } from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useParams } from "next/navigation"

// Language code mapping
const LANGUAGE_CODES = {
  uzb: ["uzb", "uz"],
  rus: ["rus", "ru"],
  eng: ["eng", "en"],
  uzb_cyr: ["uzb_cyr", "uz_cyr"],
}

export default function ProjectPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<any>(null)
  const [relatedProjects, setRelatedProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasTrackedView, setHasTrackedView] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectRef = doc(db, "Projects", projectId)
        const projectSnap = await getDoc(projectRef)

        if (projectSnap.exists()) {
          const projectData = { id: projectSnap.id, ...projectSnap.data() } as { id: string; category?: string }
          setProject(projectData)

          if (projectData.hasOwnProperty('category')) {
            const relatedRef = collection(db, "Projects")
            const relatedQuery = query(
              relatedRef,
              where("category", "==", projectData.category),
              where("id", "!=", projectId),
              limit(3),
            )

            const relatedSnap = await getDocs(relatedQuery)
            const relatedData = relatedSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            setRelatedProjects(relatedData)
          }
        } else {
          setError("Loyiha topilmadi")
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching project:", error)
        setError("Loyihani yuklashda xatolik yuz berdi")
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  useEffect(() => {
    const trackView = async () => {
      if (project && !hasTrackedView) {
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
  }, [project, hasTrackedView])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Image src="/Qonuniy.svg" alt="Qonuniy logo" width={200} height={100} />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Xatolik</AlertTitle>
          <AlertDescription>
            {error || "Loyiha topilmadi. So'ralgan loyiha mavjud emas yoki o'chirilgan bo'lishi mumkin."}
          </AlertDescription>
        </Alert>

        <div className="mt-8 text-center">
          <Link href="/project">
            <Button>Loyihalar sahifasiga qaytish</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return date.toLocaleDateString("uz-UZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (e) {
      return "Sana ko'rsatilmagan"
    }
  }

  // Get language display name
  const getLanguageDisplay = (langCode: string) => {
    if (!langCode) return ""

    if (langCode === "uzb" || langCode === "uz") return "O'zbekcha"
    if (langCode === "rus" || langCode === "ru") return "Ruscha"
    if (langCode === "eng" || langCode === "en") return "Inglizcha"
    if (langCode === "uzb_cyr" || langCode === "uz_cyr") return "Ўзбекча"

    return langCode
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/project" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Loyihalar sahifasiga qaytish
          </Link>
        </div>

        <article className="max-w-4xl mx-auto">
          {/* Project Header */}
          <header className="mb-8">
            {project.category && <Badge className="mb-4 capitalize">{project.category}</Badge>}

            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">{project.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center">
                <Image
                  src={project.authorImage || "/placeholder.svg?height=40&width=40"}
                  alt={project.author || "Muallif"}
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
                />
                <div>
                  <div className="font-medium">{project.author || "Muallif"}</div>
                  <div className="text-sm text-muted-foreground">Muharrir</div>
                </div>
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{project.date ? formatDate(project.date) : "Sana ko'rsatilmagan"}</span>
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>{project.date ? formatDistanceToNow(parseISO(project.date), { addSuffix: true }) : ""}</span>
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <Eye className="h-4 w-4 mr-1" />
                <span>{project.views || 0} ko`rishlar</span>
              </div>

              <Button variant="outline" size="sm" className="ml-auto" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Ulashish
              </Button>
            </div>
          </header>

          {/* Featured Media */}
          {project.imageUrl && !project.videoUrl && !project.images && (
            <div className="mb-8 relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={project.imageUrl || "/placeholder.svg"}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {project.videoUrl && project.videoUrl.includes("youtube") && (
            <div className="mb-8 relative aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                src={`https://www.youtube.com/embed/${project.videoUrl.split("v=")[1]?.split("&")[0] || ""}`}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                title={project.title}
              />
            </div>
          )}

          {/* Multiple images carousel */}
          {project.images && project.images.length > 0 && (
            <div className="mb-8">
              <Carousel autoPlay showControls showIndicators className="w-full">
                <CarouselContent>
                  {project.images.map((image: string, index: number) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${project.title} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselIndicators />
              </Carousel>
            </div>
          )}

          {/* Project Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-xl leading-relaxed whitespace-pre-line">{project.content}</p>
          </div>

          {/* External Links */}
          {project.linkUrl && (
            <div className="mt-8">
              <Alert variant="info">
                <AlertTitle>Qo`shimcha ma`lumot:</AlertTitle>
                <AlertDescription>
                  <a
                    href={project.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    {project.linkUrl}
                  </a>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <div className="mt-12">
              <Separator className="mb-8" />
              <h2 className="text-2xl font-bold mb-6">O`xshash loyihalar</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProjects.map((relatedProject) => (
                  <Link key={relatedProject.id} href={`/project/${relatedProject.id}`} className="group">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-3">
                      <Image
                        src={relatedProject.imageUrl || "/placeholder.svg?height=200&width=300"}
                        alt={relatedProject.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {relatedProject.title}
                    </h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        {relatedProject.date
                          ? formatDistanceToNow(parseISO(relatedProject.date), { addSuffix: true })
                          : ""}
                      </span>
                      <Eye className="h-3 w-3 ml-3 mr-1" />
                      <span>{relatedProject.views || 0}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Ulashish</h3>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Ushbu havola orqali ulashing:</p>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== "undefined" ? window.location.href : ""}
                  className="flex-1 p-2 border rounded-l-md bg-muted"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                  }}
                  className="rounded-l-none h-12"
                >
                  Nusxalash
                </Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowShareModal(false)}>
                Yopish
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

