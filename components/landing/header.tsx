import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { useRouter } from "next/navigation"

export function Header() {

  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
             <img src="/favicon.ico" alt="Logo" className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-primary">PrintCost Pro</span>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a
            href="#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Características
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Precios
          </a>
          <Button variant="outline" size="sm" onClick={() => router.push("/login")}>
            Iniciar Sesión
          </Button>
          <Button size="sm" onClick={() => router.push("/signup")}>Prueba Gratis</Button>
        </nav>
      </div>
    </header>
  )
}
