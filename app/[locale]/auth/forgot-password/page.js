'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function ForgotPassword() {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/${window.location.pathname.split('/')[1]}/auth/callback`
      })

      if (supabaseError) throw supabaseError
      
      setSubmitted(true)
    } catch {
      setError(t('forgotPassword.error'))
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="flex justify-center mb-6">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="MyApp"
                width={80}
                height={80}
                className="h-20 w-auto"
              />
            </Link>
          </div>
          <h2 className="text-2xl font-bold">{t('forgotPassword.checkEmail')}</h2>
          <p className="text-base-content/70">{t('forgotPassword.emailSent')}</p>
          <Link href="/auth/login" className="btn btn-primary">
            {t('forgotPassword.backToLogin')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <div className="flex justify-center mb-6">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="MyApp"
                width={80}
                height={80}
                className="h-20 w-auto"
              />
            </Link>
          </div>
          <h2 className="text-3xl font-bold">{t('forgotPassword.title')}</h2>
          <p className="mt-2 text-base-content/70">{t('forgotPassword.subtitle')}</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              {t('forgotPassword.email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input input-bordered w-full mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="text-sm text-center">
            <Link href="/auth/login" className="link link-primary">
              {t('forgotPassword.rememberPassword')}
            </Link>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {t('forgotPassword.resetPassword')}
          </button>
        </form>
      </div>
    </div>
  )
} 