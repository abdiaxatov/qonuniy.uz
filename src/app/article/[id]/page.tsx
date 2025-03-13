"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { parseISO } from "date-fns/parseISO"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { ArrowLeft, Share2, ExternalLink, Eye } from "lucide-react"
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

export default function ArticlePage() {
  const params = useParams()
  const articleId = params?.id as string
  const [article, setArticle] = useState<any>(null)
  const [relatedArticles, setRelatedArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasTrackedView, setHasTrackedView] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) return

      try {
        const articleRef = doc(db, "blogs", articleId)
        const articleSnap = await getDoc(articleRef)

        if (articleSnap.exists()) {
          const articleData = { id: articleSnap.id, ...articleSnap.data() } as { id: string; category?: string }
          setArticle(articleData)

          // Fetch related articles (same category)
          if (articleData.category) {
            const relatedRef = collection(db, "blogs")
            const relatedQuery = query(
              relatedRef,
              where("category", "==", articleData.category),
              where("id", "!=", articleId),
              limit(3),
            )

            const relatedSnap = await getDocs(relatedQuery)
            const relatedData = relatedSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            setRelatedArticles(relatedData)
          }
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching article:", error)
        setLoading(false)
      }
    }

    fetchArticle()
  }, [articleId])

  useEffect(() => {
    const trackView = async () => {
      if (article && !hasTrackedView) {
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
  }, [article, hasTrackedView])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        {/* <Image src="/Qonuniy.svg" alt="Qonuniy logo" width={200} height={100} /> */}
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center">
        <Image src="/Qonuniy.svg" alt="Qonuniy logo" width={200} height={100} />
        <h1 className="text-6xl font-bold mt-4 text-[#0099b5]">404</h1>
        <p className="mt-4 text-xl text-[#0099b5]">Sahifa topilmadi</p>
        <Link href="/" className="mt-6 px-4 py-2 bg-[#0099b5] text-white rounded hover:bg-[#009ab5c2]">
          Bosh sahifaga qaytish
        </Link>
      </div>
    )
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

  const handleShare = () => {
    setShowShareModal(true)
  }

  return (
    <main className="min-h-screen bg-background mb-12">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Bosh sahifaga qaytish
          </Link>
        </div>

        <article className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#0099b5]">{article.title}</h1>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="outline">{article.author || "Muallif"}</Badge>
              {article.language && (
                <Badge variant="secondary" className="text-xs">
                  {getLanguageDisplay(article.language)}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {article.date
                  ? formatDistanceToNow(parseISO(article.date), { addSuffix: true })
                  : "Sana ko'rsatilmagan"}
              </span>
              <div className="flex items-center text-sm text-muted-foreground">
                <Eye className="h-4 w-4 mr-1" />
                <span>{article.views || 0} ko`rishlar</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {article.linkUrl && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={article.linkUrl} target="_blank" rel="noopener noreferrer">
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
          {article.imageUrl && !article.videoUrl && !article.images && (
            <div className="mb-8 w-full">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={article.imageUrl || "/placeholder.svg"}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {article.videoUrl && (
            <div className="mb-8 w-full">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <iframe
                  src={getYouTubeEmbedUrl(article.videoUrl) || undefined}
                  title="YouTube video preview"
                  className="absolute inset-0 w-full h-full rounded-md"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          {article.images && article.images.length > 0 && (
            <div className="mb-8 w-full">
              <Carousel className="w-full">
                <CarouselContent>
                  {article.images.map((image: string, index: number) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${article.title} - Image ${index + 1}`}
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
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-12 border-t pt-8">
              <h2 className="text-2xl font-bold mb-6">O`xshash maqolalar</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <Link key={relatedArticle.id} href={`/article/${relatedArticle.id}`} className="group">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-3">
                      <Image
                        src={relatedArticle.imageUrl || "/placeholder.svg?height=200&width=300"}
                        alt={relatedArticle.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold group-hover:text-primary text-[#0099b5] transition-colors line-clamp-2">
                      {relatedArticle.title}
                    </h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <span>
                        {relatedArticle.date
                          ? formatDistanceToNow(parseISO(relatedArticle.date), { addSuffix: true })
                          : ""}
                      </span>
                      <Eye className="h-3 w-3 ml-3 mr-1" />
                      <span>{relatedArticle.views || 0}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>

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
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
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