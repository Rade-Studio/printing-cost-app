"use client"

import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { DemoSection } from "@/components/landing/demo-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { Footer } from "@/components/landing/footer"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (AuthService.isAuthenticated()) {
      router.push("/dashboard")
      return
    }

    // Preload critical images for landing page
    const imageUrls = [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/02-QLOm5A3UcrgPOltkedRTgFsLKTCtCx.png",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/08-pqd0xjiv6SSOGsCX0R92swLOsN3XVa.png",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11-zK07BOpexmu7i3peLj2ZpDtJG00FoB.png",
    ]
    imageUrls.forEach((url) => {
      const img = new Image()
      img.src = url
    })
  }, [router])

  // Show loading for authenticated users being redirected
  if (AuthService.isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="landing-page min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="relative pt-16">
        <HeroSection />
        <DemoSection />
        <FeaturesSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}
