"use client"

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next"

/**
 * Drops the query string on pages whose URL carries a secret (the one-time password reset token).
 */
function stripSecretQuery(event: BeforeSendEvent): BeforeSendEvent {
  const url = new URL(event.url)
  if (url.pathname.startsWith("/restablecer-contrasena")) {
    url.search = ""
    return { ...event, url: url.toString() }
  }
  return event
}

export function SiteAnalytics() {
  return <Analytics beforeSend={stripSecretQuery} />
}
