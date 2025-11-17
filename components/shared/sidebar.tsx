"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AuthService } from "@/lib/auth"
import { useSidebar } from "@/lib/contexts/sidebar-context"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
  History,
  Calculator,
  FileText,
  ChevronDown,
  ChevronRight,
  Database,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"

// Tipos para la estructura de navegación
type NavigationItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

type NavigationSection = {
  name: string
  icon?: React.ComponentType<{ className?: string }>
  items: NavigationItem[]
  collapsible?: boolean
}

// Estructura de navegación jerárquica
const navigationSections: NavigationSection[] = [
  {
    name: "CALCULADORA",
    items: [
      { name: "Calculadora de Costos", href: "/calculadora-costos", icon: Calculator },
    ],
  },
  {
    name: "TABLERO",
    items: [
      { name: "Tablero", href: "/dashboard", icon: BarChart3 },
    ],
  },
  {
    name: "COTIZACIONES",
    items: [
      { name: "Cotizaciones", href: "/cotizaciones", icon: FileText },
    ],
  },
  {
    name: "REGISTROS",
    icon: Database,
    collapsible: true,
    items: [
      { name: "Ventas", href: "/ventas", icon: ShoppingCart },
      { name: "Clientes", href: "/clientes", icon: Users },
      { name: "Historial de Impresión", href: "/historial-impresion", icon: History },
      { name: "Productos", href: "/productos", icon: Package },
      { name: "Gastos", href: "/gastos", icon: Receipt },
    ],
  },
  {
    name: "SISTEMA",
    icon: Settings,
    collapsible: true,
    items: [
      { name: "Filamentos", href: "/filamentos", icon: Layers3 },
      { name: "Paquete de Trabajo", href: "/paquetes-trabajo", icon: HammerIcon },
      { name: "Impresoras", href: "/impresoras", icon: Printer },
      { name: "Configuraciones", href: "/configuracion", icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())
  const { isCollapsed, setIsCollapsed } = useSidebar()

  // Auto-expandir secciones que contienen la ruta activa
  useEffect(() => {
    const activeSections = new Set<string>()
    navigationSections.forEach((section) => {
      const hasActiveItem = section.items.some((item) => pathname === item.href)
      if (hasActiveItem && section.collapsible) {
        activeSections.add(section.name)
      }
    })
    setOpenSections(activeSections)
  }, [pathname])

  const handleLogout = useMemo(() => {
    return () => {
      AuthService.logout()
      router.push("/login")
    }
  }, [router])

  const toggleSection = (sectionName: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionName)) {
        next.delete(sectionName)
      } else {
        next.add(sectionName)
      }
      return next
    })
  }

  // Verificar si una sección tiene un item activo
  const isSectionActive = (section: NavigationSection): boolean => {
    return section.items.some((item) => pathname === item.href)
  }

  // Renderizar un item de navegación
  const renderNavItem = (item: NavigationItem, isNested: boolean = false) => {
    const isActive = pathname === item.href
    const Icon = item.icon

    return (
      <Link
        key={item.href}
        href={item.href}
        prefetch={true}
        onClick={() => setIsMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-2.5 md:gap-3 rounded-lg text-sm font-medium transition-all duration-200 group relative",
          "hover:scale-[1.02] active:scale-[0.98]",
          isCollapsed ? "justify-center px-2 py-2.5" : "px-2.5 md:px-3 py-2 md:py-2.5",
          isNested && !isCollapsed && "ml-3 md:ml-4 pl-5 md:pl-6 border-l-2 border-sidebar-border/50",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm font-semibold"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        )}
        title={isCollapsed ? item.name : undefined}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {!isCollapsed && <span className="truncate">{item.name}</span>}
        {/* Tooltip cuando está colapsado */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 border border-border">
            {item.name}
          </div>
        )}
      </Link>
    )
  }

  // Renderizar una sección
  const renderSection = (section: NavigationSection, index: number) => {
    const isActive = isSectionActive(section)
    const isOpen = openSections.has(section.name)
    const SectionIcon = section.icon
    const isFirstSection = index === 0

    // Si la sección no es colapsable, renderizar items directamente
    if (!section.collapsible) {
      return (
        <div key={section.name} className={cn("space-y-1", !isFirstSection && !isCollapsed && "mt-4 pt-4 border-t border-sidebar-border/50")}>
          {section.items.map((item) => renderNavItem(item))}
        </div>
      )
    }

    // Si está colapsado, mostrar solo el icono de la sección como un botón que expande
    if (isCollapsed) {
      return (
        <div key={section.name} className={cn("space-y-1", !isFirstSection && "mt-2")}>
          <button
            onClick={() => {
              setIsCollapsed(false)
              if (!isOpen) {
                toggleSection(section.name)
              }
            }}
            className={cn(
              "w-full flex items-center justify-center px-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 relative group",
              "hover:scale-[1.02] active:scale-[0.98]",
              isActive
                ? "text-sidebar-primary bg-sidebar-primary/10 border border-sidebar-primary/20 shadow-sm"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground",
            )}
            title={section.name}
          >
            {SectionIcon && <SectionIcon className="h-4 w-4 flex-shrink-0" />}
            {/* Tooltip cuando está colapsado */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 border border-border">
              {section.name}
            </div>
          </button>
        </div>
      )
    }

    // Sección colapsable expandida
    return (
      <div key={section.name} className={cn(!isFirstSection && "mt-4 pt-4 border-t border-sidebar-border/50")}>
        <Collapsible
          open={isOpen}
          onOpenChange={() => toggleSection(section.name)}
        >
          <CollapsibleTrigger
            className={cn(
              "w-full flex items-center justify-between gap-2 px-2.5 md:px-3 py-2.5 md:py-3 rounded-lg text-sm font-semibold transition-all duration-200 mb-1",
              "hover:scale-[1.02] active:scale-[0.98]",
              isActive
                ? "text-sidebar-primary bg-sidebar-primary/10 border border-sidebar-primary/20 shadow-sm"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground",
            )}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {SectionIcon && <SectionIcon className="h-4 w-4 flex-shrink-0" />}
              <span className="truncate">{section.name}</span>
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform duration-200 rotate-0" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0 transition-transform duration-200" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-1 pl-0">
            {section.items.map((item) => renderNavItem(item, true))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    )
  }

  // Memoizar los elementos de navegación
  const navigationItems = useMemo(() => {
    return navigationSections.map((section, index) => renderSection(section, index))
  }, [pathname, openSections, isCollapsed])

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-3 left-3 md:top-4 md:left-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background/80 backdrop-blur-sm shadow-lg border-2"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-sidebar border-r border-sidebar-border transform transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64 md:w-64 lg:w-64",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo y botón de colapsar */}
          <div className="flex items-center gap-2 p-3 md:p-4 border-b border-sidebar-border flex-shrink-0">
            {!isCollapsed ? (
              <>
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center flex-shrink-0">
                  <img src="/logo.svg" alt="Logo" className="h-8 w-8 md:h-10 md:w-10" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base md:text-lg font-bold text-sidebar-foreground leading-tight">
                    <span className="text-primary font-extrabold">3D</span> Print Cost
                  </h1>
                  <p className="text-xs md:text-sm text-sidebar-foreground/70 truncate">Gestión de Impresión 3D</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(true)}
                  className="h-8 w-8 flex-shrink-0 hover:bg-sidebar-accent/50"
                  title="Colapsar menú"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center w-full gap-2">
                <div className="flex h-10 w-10 items-center justify-center">
                  <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(false)}
                  className="h-8 w-8 hover:bg-sidebar-accent/50"
                  title="Expandir menú"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className={cn("flex-1 overflow-y-auto overflow-x-hidden space-y-1", isCollapsed ? "p-2" : "p-3 md:p-4")}>
            {navigationItems}
          </nav>

          {/* Logout button */}
          <div className={cn("border-t border-sidebar-border flex-shrink-0", isCollapsed ? "p-2" : "p-3 md:p-4")}>
            <Button
              variant="ghost"
              className={cn(
                "w-full text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg py-2.5 text-sm relative group",
                isCollapsed ? "justify-center px-2" : "justify-start gap-3"
              )}
              onClick={handleLogout}
              title={isCollapsed ? "Cerrar sesión" : undefined}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">Cerrar sesión</span>}
              {/* Tooltip cuando está colapsado */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 border border-border">
                  Cerrar sesión
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
