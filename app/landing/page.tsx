"use client"

import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { DemoSection } from "@/components/landing/demo-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { Footer } from "@/components/landing/footer"
import { useEffect } from "react"

export default function LandingPage() {
  useEffect(() => {
    // Preload critical images
    const imageUrls = [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/02-QLOm5A3UcrgPOltkedRTgFsLKTCtCx.png",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/08-pqd0xjiv6SSOGsCX0R92swLOsN3XVa.png",
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11-zK07BOpexmu7i3peLj2ZpDtJG00FoB.png",
    ]
    imageUrls.forEach((url) => {
      const img = new Image()
      img.src = url
    })
  }, [])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="relative">
        <HeroSection />
        <DemoSection />
        <FeaturesSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}
