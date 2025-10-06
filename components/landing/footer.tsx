import { Printer } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-[#E6F3F4]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-12 w-12 items-center justify-center">
                <img src="/logo.svg" alt="Logo" className="h-10 w-10" />
              </div>
              <span className="text-xl font-bold text-[#0B8B92]">
                <span className="font-extrabold">3D</span> Print Cost
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              La solución completa para gestionar tu negocio de impresión 3D de manera profesional y eficiente.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Producto</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Características
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Precios
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Demo
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Actualizaciones
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Soporte</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Centro de Ayuda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Documentación
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Contacto
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Estado del Sistema
                </a>
              </li>
            </ul>
          </div>

          <div className="relative">
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Acerca de
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Términos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Privacidad
                </a>
              </li>
            </ul>
            
            {/* Rade Studio Logo - Positioned at the same height as "Empresa" title */}
            <div className="absolute -top-8 -right-12 flex items-center justify-center">
              <div className="flex h-64 w-72 items-center justify-center">
                <img 
                  src="/logo_rade.png" 
                  alt="Rade Studio Logo" 
                  className="h-64 w-72 object-contain" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-gray-600">
          <p>&copy; 2025 <span className="font-extrabold">3D</span> Print Cost. Todos los derechos reservados.</p>
          <p>
            Hecho con <span className="text-red-600">❤</span> por{" "}
            <a 
              href="https://github.com/Rade-Studio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#0B8B92] hover:text-[#0B8B92]/80 font-semibold transition-colors underline"
            >
              RADE Studio S.A.S
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
