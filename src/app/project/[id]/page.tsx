"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { parseISO } from "date-fns/parseISO"
import { ArrowLeft, Eye, Share2, ExternalLink } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Helper function to get YouTube embed URL
const getYouTubeEmbedUrl = (url: string) => {
  if (!url || (!url.includes("youtube.com") && !url.includes("youtu.be"))) return null

  let videoId = ""
  if (url.includes("youtube.com/watch")) {
    videoId = url.split("v=")[1]?.split("&")[0] || ""
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split("?")[0] || ""
  }

  if (!videoId) return null
  return `https://www.youtube.com/embed/${videoId}`
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
      if (!projectId) return

      try {
        const projectRef = doc(db, "Projects", projectId)
        const projectSnap = await getDoc(projectRef)

        if (projectSnap.exists()) {
          const projectData = { id: projectSnap.id, ...projectSnap.data() } as { id: string; category?: string }
          setProject(projectData)

          // Fetch related projects (same category)
          if (projectData.category) {
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center">
        <Image src="/Qonuniy.svg" alt="Qonuniy logo" width={200} height={100} />
        <h1 className="text-6xl font-bold mt-4 text-[#0099b5]">404</h1>
        <p className="mt-4 text-xl text-[#0099b5]">Loyiha topilmadi</p>
        <Link href="/project" className="mt-6 px-4 py-2 bg-[#0099b5] text-white rounded hover:bg-[#009ab5c2]">
          Loyihalar sahifasiga qaytish
        </Link>
      </div>
    )
  }

  const handleShare = () => {
    setShowShareModal(true)
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
    <main className="min-h-screen bg-background mb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/project" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Loyihalar sahifasiga qaytish
          </Link>
        </div>

        <article className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-4  text-[#0099b5]">{project.title}</h1>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="outline">{project.author || "Muallif"}</Badge>
              {project.language && (
                <Badge variant="secondary" className="text-xs">
                  {getLanguageDisplay(project.language)}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {project.date
                  ? formatDistanceToNow(parseISO(project.date), { addSuffix: true })
                  : "Sana ko'rsatilmagan"}
              </span>
              <div className="flex items-center text-sm text-muted-foreground">
                <Eye className="h-4 w-4 mr-1" />
                <span>{project.views || 0} ko`rishlar</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {project.linkUrl && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={project.linkUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Link
                    </a>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Ulashish
                </Button>
              </div>
            </div>
          </div>

          {/* Media Section - Before Content */}
          {project.imageUrl && !project.videoUrl && !project.images && (
            <div className="mb-8 w-full">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={project.imageUrl || "/placeholder.svg"}
                  alt={project.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {project.videoUrl && (
            <div className="mb-8 w-full">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                  src={getYouTubeEmbedUrl(project.videoUrl) || undefined}
                  title="YouTube video preview"
                  className="absolute inset-0 w-full h-full rounded-md"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {project.images && project.images.length > 0 && (
            <div className="mb-8 w-full">
              <Carousel className="w-full">
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
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>
          )}

          {/* Content Section */}
          <div className="prose prose-lg dark:prose-invert max-w-none ">
            <div dangerouslySetInnerHTML={{ __html: project.content }} />
          </div>

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <div className="mt-12 border-t pt-8">
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