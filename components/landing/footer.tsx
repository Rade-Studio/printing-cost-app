import { Printer } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-[#E6F3F4]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B8B92]">
                <Printer className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#0B8B92]">PrintCost Pro</span>
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

          <div>
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
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-gray-600">
          <p>&copy; 2025 PrintCost Pro. Todos los derechos reservados.</p>
          <p>
            Hecho con <span className="text-red-600">❤</span> por{" RADE Studio S.A.S"}
            </p>
        </div>
      </div>
    </footer>
  )
}
