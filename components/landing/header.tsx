"use client"

import { Button } from "@/components/ui/button"
import { Printer, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export function Header() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#E6F3F4]/95 backdrop-blur-md shadow-sm' 
          : 'bg-[#E6F3F4]/95 backdrop-blur supports-[backdrop-filter]:bg-[#E6F3F4]/60'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B8B92]/10">
               <img src="/favicon.ico" alt="Logo" className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-[#0B8B92]">PrintCost Pro</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#features"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Características
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Precios
            </a>
            <Button variant="outline" size="sm" onClick={() => router.push("/login")}>
              Iniciar Sesión
            </Button>
            {/* <Button size="sm" onClick={() => router.push("/signup")} className="bg-[#0B8B92] hover:bg-[#0B8B92]/90">
              Prueba Gratis
            </Button> */}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 z-40 bg-[#E6F3F4] border-b shadow-lg">
          <div className="px-4 py-6 space-y-4">
            <nav className="space-y-4">
              <a
                href="#features"
                className="block text-base font-medium text-gray-600 hover:text-gray-900 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Características
              </a>
              <a
                href="#pricing"
                className="block text-base font-medium text-gray-600 hover:text-gray-900 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Precios
              </a>
            </nav>
            
            <div className="pt-4 space-y-3">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  router.push("/login")
                  setIsMobileMenuOpen(false)
                }}
              >
                Iniciar Sesión
              </Button>
              {/* <Button 
                className="w-full bg-[#0B8B92] hover:bg-[#0B8B92]/90" 
                onClick={() => {
                  router.push("/signup")
                  setIsMobileMenuOpen(false)
                }}
              >
                Prueba Gratis
              </Button> */}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 z-30 top-16"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
