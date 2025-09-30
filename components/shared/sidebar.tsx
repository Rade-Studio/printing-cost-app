"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AuthService } from "@/lib/auth"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  Users,
  ShoppingCart,
  Package,
  Settings,
  Receipt,
  BarChart3,
  LogOut,
  Menu,
  X,
  Layers3,
  HammerIcon,
  Printer,
  History
} from "lucide-react"

const navigation = [
  { name: "Tablero", href: "/dashboard", icon: BarChart3 },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Ventas", href: "/ventas", icon: ShoppingCart },
  { name: "Historial de Impresión", href: "/historial-impresion", icon: History },
  { name: "Filamentos", href: "/filamentos", icon: Layers3 },
  { name: "Productos", href: "/productos", icon: Package },
  { name: "Impresoras", href: "/impresoras", icon: Printer },
  { name: "Paquetes de Trabajo", href: "/paquetes-trabajo", icon: HammerIcon },
  { name: "Gastos", href: "/gastos", icon: Receipt },
  { name: "Configuración", href: "/configuracion", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = useMemo(() => {
    return () => {
      AuthService.logout()
      router.push("/login")
    }
  }, [router])

  // Memoizar los elementos de navegación para evitar re-renders
  const navigationItems = useMemo(() => {
    return navigation.map((item) => {
      const isActive = pathname === item.href
      return (
        <Link
          key={item.name}
          href={item.href}
          prefetch={true} // Habilitar prefetch para navegación más rápida
          onClick={() => setIsMobileMenuOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
            isActive
              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.name}
        </Link>
      )
    })
  }, [pathname])

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
            <div className="p-2 bg-sidebar-primary/10 rounded-lg">

              {/* Icono de imagen */}
              <img src="/favicon.ico" alt="Logo" className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">PrintCost Pro</h1>
              <p className="text-sm text-sidebar-foreground/70">Gestión de Impresión 3D</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigationItems}
          </nav>

          {/* Theme toggle and Logout button */}
          <div className="p-4 border-t border-sidebar-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-sidebar-foreground/70">Tema</span>
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-xl py-3"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  )
}
