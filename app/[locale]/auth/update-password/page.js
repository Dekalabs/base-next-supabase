'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default function UpdatePassword() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('updatePassword.passwordMismatch'))
      return
    }

    setLoading(true)

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      const { error: supabaseError } = await supabase.auth.updateUser({
        password: password
      })

      if (supabaseError) throw supabaseError

      const locale = window.location.pathname.split('/')[1]
      router.replace(`/${locale}/auth/login?passwordUpdated=true`)
    } catch {
      setError(t('updatePassword.error'))
    } finally {
      setLoading(false)
    }
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
          <h2 className="text-3xl font-bold">{t('updatePassword.title')}</h2>
          <p className="mt-2 text-base-content/70">{t('updatePassword.subtitle')}</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                {t('updatePassword.newPassword')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input input-bordered w-full mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium">
                {t('updatePassword.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="input input-bordered w-full mt-1"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {t('updatePassword.submit')}
          </button>
        </form>
      </div>
    </div>
  )
} 