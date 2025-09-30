"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, Loader2, Crown, Calculator, BarChart3, Users, Settings, FileText, Clock, Shield, Zap } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function PaymentResultPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | 'pending'>('pending')
  const [message, setMessage] = useState('')
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const handlePaymentResult = async () => {
      try {
        // Obtener parámetros de la URL
        const params = new URLSearchParams(window.location.search)
        const boldOrderId = params.get("bold-order-id")
        const status = params.get("bold-tx-status")

        console.log("Order ID:", boldOrderId)
        console.log("Status:", status)

        setOrderId(boldOrderId)

        if (status === "approved" && boldOrderId) {
          // Verificar el pago con el backend
          const verification = await apiClient.verifyBoldPayment(boldOrderId)
          
           if (verification?.success) {
             setPaymentStatus('success')
             setMessage('¡Bienvenido a PrintCost Pro! Tu suscripción ha sido activada exitosamente.')
           } else {
             setPaymentStatus('error')
             setMessage(verification?.message || 'Error al verificar el pago. Por favor, contacta soporte.')
           }
        } else {
          setPaymentStatus('error')
          setMessage('El pago no fue aprobado o falta información de la transacción.')
        }
      } catch (error) {
        console.error('Error processing payment result:', error)
        setPaymentStatus('error')
        setMessage('Error al procesar el resultado del pago. Por favor, contacta soporte.')
      } finally {
        setIsLoading(false)
      }
    }

    // Solo procesar si no hemos procesado ya
    if (isLoading && !orderId) {
      handlePaymentResult()
    }
  }, []) // ← Eliminar dependencia del router

  const handleRetryPayment = () => {
    router.push('/renovar-suscripcion')
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Procesando resultado del pago...
          </h2>
          <p className="text-gray-600">
            Por favor espera mientras verificamos tu transacción.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-4 px-4 flex items-center justify-center">
      <div className="max-w-7xl mx-auto w-full">
        {paymentStatus === 'success' && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
            {/* Panel izquierdo - Header y beneficios */}
            <div className="w-full lg:w-1/2 flex flex-col">
              {/* Header con gradiente */}
              <div className="bg-gradient-to-r from-primary to-purple-600 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-center text-white flex-shrink-0">
                <div className="flex items-center justify-center mb-3">
                  <Crown className="h-6 w-6 sm:h-8 sm:w-8 mr-2" />
                  <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-300" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold mb-2">
                  ¡Bienvenido a PrintCost Pro!
                </h1>
                <p className="text-xs sm:text-sm text-blue-100 mb-1">
                  Tu suscripción ha sido activada exitosamente
                </p>
                {orderId && (
                  <p className="text-xs text-blue-200">
                    ID: {orderId}
                  </p>
                )}
              </div>

              {/* Grid de beneficios compacto */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">
                  Herramientas profesionales incluidas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Cálculo de Costos</h3>
                    <p className="text-xs text-gray-600">Automático con filamento, electricidad y tiempo</p>
                  </div>

                  <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                    <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Análisis de Rentabilidad</h3>
                    <p className="text-xs text-gray-600">Gráficos de ganancias y márgenes</p>
                  </div>

                  <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Gestión de Clientes</h3>
                    <p className="text-xs text-gray-600">Base de datos e historial completo</p>
                  </div>

                  <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                    <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mx-auto mb-2" />
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Configuración Avanzada</h3>
                    <p className="text-xs text-gray-600">Personaliza impresoras y filamentos</p>
                  </div>

                  <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mx-auto mb-2" />
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Reportes Detallados</h3>
                    <p className="text-xs text-gray-600">Ventas, gastos y rentabilidad</p>
                  </div>

                  <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200">
                    <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 mx-auto mb-2" />
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Historial Completo</h3>
                    <p className="text-xs text-gray-600">Registro de impresiones y transacciones</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel derecho - Características premium y CTA */}
            <div className="w-full lg:w-1/2 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
              {/* Características premium */}
              <div className="flex-1 p-4 sm:p-6 lg:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
                  Características Premium
                </h3>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Seguridad Avanzada</h4>
                      <p className="text-sm sm:text-base text-gray-600">Encriptación de nivel empresarial para proteger todos tus datos</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Sincronización en Tiempo Real</h4>
                      <p className="text-sm sm:text-base text-gray-600">Actualización automática en todos tus dispositivos</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Análisis Predictivo</h4>
                      <p className="text-sm sm:text-base text-gray-600">Predice tendencias y optimiza tu estrategia de precios</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <Users className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Soporte Prioritario</h4>
                      <p className="text-sm sm:text-base text-gray-600">Acceso directo a nuestro equipo de soporte especializado</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to action */}
              <div className="p-4 sm:p-6 lg:p-8 text-center bg-white border-t border-gray-200">
                <button
                  onClick={handleGoToDashboard}
                  className="bg-gradient-to-r from-primary to-purple-600 text-white px-8 sm:px-12 lg:px-16 py-3 sm:py-4 rounded-xl text-lg sm:text-xl font-semibold hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
                >
                  Comenzar a Usar PrintCost Pro
                </button>
                <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-lg">
                  ¡Tu viaje hacia la optimización comienza ahora!
                </p>
              </div>
            </div>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
            {/* Panel izquierdo - Error y opciones */}
            <div className="w-full lg:w-1/2 flex flex-col">
              {/* Header con gradiente rojo */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-center text-white flex-shrink-0">
                <div className="flex items-center justify-center mb-3">
                  <XCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-200" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold mb-2">
                  Pago No Procesado
                </h1>
                <p className="text-xs sm:text-sm text-red-100 mb-1">
                  No se pudo completar la transacción
                </p>
                {orderId && (
                  <p className="text-xs text-red-200">
                    ID: {orderId}
                  </p>
                )}
              </div>

              {/* Mensaje de error y opciones */}
              <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                    ¿Qué puedes hacer ahora?
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                    {message}
                  </p>
                </div>

                {/* Opciones de acción */}
                <div className="space-y-3 sm:space-y-4">
                  <button
                    onClick={handleRetryPayment}
                    className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl text-base sm:text-lg font-semibold hover:from-primary/90 hover:to-blue-600/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Intentar Pago Nuevamente
                  </button>
                  <button
                    onClick={handleGoToDashboard}
                    className="w-full bg-gray-200 text-gray-800 py-3 sm:py-4 px-4 sm:px-6 rounded-xl text-base sm:text-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                  >
                    Ir al Dashboard
                  </button>
                </div>

                {/* Información de soporte */}
                <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-900 mb-1 sm:mb-2">
                    ¿Necesitas ayuda?
                  </h3>
                  <p className="text-xs text-blue-700">
                    Si el problema persiste, contacta a nuestro equipo de soporte. Estamos aquí para ayudarte.
                  </p>
                </div>
              </div>
            </div>

            {/* Panel derecho - Información y beneficios */}
            <div className="w-full lg:w-1/2 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
              {/* Información del problema */}
              <div className="flex-1 p-4 sm:p-6 lg:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
                  Posibles Causas
                </h3>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-xs sm:text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Fondos Insuficientes</h4>
                      <p className="text-sm sm:text-base text-gray-600">Verifica que tu tarjeta tenga saldo suficiente para la transacción</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-xs sm:text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Datos Incorrectos</h4>
                      <p className="text-sm sm:text-base text-gray-600">Revisa que la información de tu tarjeta sea correcta</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-xs sm:text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Límite de Transacción</h4>
                      <p className="text-sm sm:text-base text-gray-600">Tu banco puede tener límites de transacción en línea</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-xs sm:text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">Problemas de Conexión</h4>
                      <p className="text-sm sm:text-base text-gray-600">Verifica tu conexión a internet y vuelve a intentar</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recordatorio de beneficios */}
              <div className="p-4 sm:p-6 lg:p-8 text-center bg-white border-t border-gray-200">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                  Recuerda: PrintCost Pro te espera
                </h4>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  Una vez que completes tu pago, tendrás acceso a todas nuestras herramientas profesionales
                </p>
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs text-gray-500">
                  <span>✓ Cálculo de costos</span>
                  <span>✓ Análisis de rentabilidad</span>
                  <span>✓ Gestión de clientes</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
