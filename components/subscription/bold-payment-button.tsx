"use client"

import { useEffect, useRef, useState } from "react"
import { apiClient } from "@/lib/api"
import { BoldPaymentData } from "@/lib/types"

interface BoldPaymentButtonProps {
  onPaymentSuccess?: (orderId?: string) => void
  onPaymentError?: (error: string) => void
  className?: string
  children?: React.ReactNode
}

export function BoldPaymentButton({ 
  onPaymentSuccess, 
  onPaymentError, 
  className = "",
  children 
}: BoldPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentData, setPaymentData] = useState<BoldPaymentData | null>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Cargar el script de Bold.co si no está ya cargado
    const loadBoldScript = () => {
      if (document.querySelector('script[src*="boldPaymentButton.js"]')) {
        return Promise.resolve()
      }

      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://checkout.bold.co/library/boldPaymentButton.js'
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Error al cargar el script de Bold.co'))
        document.head.appendChild(script)
      })
    }

    // Obtener los datos de pago y cargar el script
    const initializeBold = async () => {
      try {
        setIsLoading(true)
        
        // Obtener los datos de pago de la API
        const response = await apiClient.getBoldPaymentData()
        
        if (!response?.apiKey || !response?.orderId || !response?.hash || !response?.amount || !response?.description || !response?.currency) {
          throw new Error("No se pudieron obtener los datos de pago de Bold.co")
        }

        setPaymentData(response)
        
        // Cargar el script de Bold.co
        await loadBoldScript()
        
      } catch (error) {
        console.error("Error al inicializar Bold.co:", error)
        onPaymentError?.(error instanceof Error ? error.message : "Error al inicializar el sistema de pagos")
      } finally {
        setIsLoading(false)
      }
    }

    // Solo inicializar si no tenemos datos de pago
    if (!paymentData) {
      initializeBold()
    }
  }, []) // ← Eliminar dependencias que causan re-ejecuciones

  useEffect(() => {
    // Crear el botón de Bold.co cuando tengamos los datos de pago
    if (paymentData && buttonRef.current && !buttonRef.current.querySelector('script[data-bold-button]')) {
      console.log('Creating Bold.co payment button...', paymentData)
      const script = document.createElement('script')
      script.setAttribute('data-bold-button', 'dark-L')
      script.setAttribute('data-api-key', paymentData.apiKey)
      script.setAttribute('data-order-id', paymentData.orderId)
      script.setAttribute('data-integrity-signature', paymentData.hash)
      script.setAttribute('data-description', paymentData.description)
      script.setAttribute('data-amount', paymentData.amount.toString())
      script.setAttribute('data-currency', paymentData.currency)
      script.setAttribute('data-redirection-url', `${window.location.origin}/payment-result`)
      script.setAttribute('data-render-mode', 'embedded')
      
      // Configurar datos del cliente
      const customerData = {
        email: paymentData.email,
        fullName: paymentData.name,
        phone: paymentData.phone,
        dialCode: paymentData.dialCode ||  "",
        documentNumber: paymentData.documentNumber || "", 
        documentType: paymentData.documentType || "" 
      }
      script.setAttribute('data-customer-data', JSON.stringify(customerData))
      
      // Configurar callback de éxito
      script.setAttribute('data-success-callback', 'handleBoldPaymentSuccess')
      
      buttonRef.current.appendChild(script)
      
      // Definir la función de callback global
      ;(window as any).handleBoldPaymentSuccess = (response: any) => {
        console.log('Bold payment response:', response)
        
        // Extraer información del pago
        const orderId = response?.o?.match(/bold-order-id=([^&]+)/)?.[1]
        const status = response?.o?.match(/bold-tx-status=([^&]+)/)?.[1]
        console.log('Status:', status)
        console.log('Order ID:', orderId)
        
        if (status === 'approved' && orderId) {
          console.log('Payment approved for order:', orderId)
          onPaymentSuccess?.(orderId)
        } else {
          console.log('Payment not approved or missing order ID')
          onPaymentError?.('El pago no fue aprobado')
        }
      }
    }
  }, [paymentData, onPaymentSuccess])

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-14 bg-primary text-primary-foreground rounded-md ${className}`}>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
        Cargando sistema de pagos...
      </div>
    )
  }

  return (
    <div 
      ref={buttonRef}
      className={`flex justify-center ${className}`}
    >
      {children && (
        <div className="text-center mb-4">
          {children}
        </div>
      )}
    </div>
  )
}
