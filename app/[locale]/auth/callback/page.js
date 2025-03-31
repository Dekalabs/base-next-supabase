'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = window.location.pathname.split('/')[1] || 'es'

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obtener parámetros tanto de la query como del hash
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
        const type = searchParams.get('type') || hashParams.get('type')

        console.log('Parameters:', {
          queryType: searchParams.get('type'),
          hashType: hashParams.get('type'),
          finalType: type
        })

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )

        // Primero verificamos si es una recuperación de contraseña
        if (type === 'recovery') {
          console.log('Redirecting to update password')
          router.replace(`/${locale}/auth/update-password`)
          return
        }

        // Para otros casos (verificación de email)
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) throw error

        if (user) {
          router.replace(`/${locale}/auth/login?verified=true`)
        } else {
          throw new Error('No user found')
        }
      } catch (error) {
        console.error('Error in auth callback:', error)
        router.replace(`/${locale}/auth/login?error=true`)
      }
    }

    handleCallback()
  }, [locale, router, searchParams])

  return null
}

export default function AuthCallback() {
  return (
    <Suspense fallback={null}>
      <CallbackContent />
    </Suspense>
  )
} 