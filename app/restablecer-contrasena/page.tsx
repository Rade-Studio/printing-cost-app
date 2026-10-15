import { Suspense } from "react"
import type { Metadata } from "next"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

// The URL carries a one-time reset token: keep it out of search engines and Referer headers
export const metadata: Metadata = {
  title: "Crear contraseña nueva",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
