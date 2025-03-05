"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Header from "@/components/header"
import Speed from "@/components/Speed"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Mona_Sans as FontSans } from "next/font/google"
import "./globals.css"
import { motion, useScroll } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { scrollYProgress } = useScroll()
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  // Check if the current route should show a 404 page
  // This is a client-side approach to detect 404s
  const [is404, setIs404] = useState(false)

  useEffect(() => {
    // Check if the current path should be a 404
    // This is a simplified approach - in a real app you might want to
    // check against a list of valid routes or use Next.js's built-in handling
    const checkRoute = async () => {
      try {
        // Add your valid routes here
        const validRoutes = ["/", "/about", "/contact", "/services", "/blog"]

        // If the pathname is not in validRoutes and not a dynamic route
        // (you may need to adjust this logic based on your app's routes)
        if (!validRoutes.includes(pathname) && !pathname.startsWith("/blog/") && !pathname.startsWith("/services/")) {
          setIs404(true)
        } else {
          setIs404(false)
        }
      } catch (error) {
        console.error("Route check error:", error)
      }
    }

    checkRoute()
  }, [pathname])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000) // Simulate loading for 1 second

    return () => clearTimeout(timer)
  }, [])

  // 404 Page Component
  const NotFoundPage = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center">
      <Image src="/Qonuniy.svg" alt="Qonuniy logo" width={200} height={100} />
      <h1 className="text-6xl font-bold mt-4 text-[#0099b5]">404</h1>
      <p className="mt-4 text-xl text-[#0099b5]">Sahifa topilmadi</p>
      <Link href="/" className="mt-6 px-4 py-2 bg-[#0099b5] text-white rounded hover:bg-[#009ab5c2]">
        Bosh sahifaga qaytish
      </Link>
    </div>
  )

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/Qonuniy.svg" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen ">
            <Image src="/Qonuniy.svg" alt="Qonuniy logo" width={200} height={100} />
          </div>
        ) : is404 ? (
          <NotFoundPage />
        ) : (
          <>
            <motion.div className="progress-bar" style={{ scaleX: scrollYProgress }} />
            <ThemeProvider attribute="class" defaultTheme="light">
              <TooltipProvider delayDuration={0}>
                <div className="fixed top-0 left-0 right-0 z-50 h-16">
                  <Header />
                </div>
                <div className="pt-16">{children}</div>
                <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto mb-4 flex origin-bottom h-full max-h-14 items-center gap-20 justify-center">
                  <Navbar />
                  <Speed />
                </div>
              </TooltipProvider>
            </ThemeProvider>
          </>
        )}
      </body>
    </html>
  )
}

