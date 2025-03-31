'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService } from '../../../lib/services/auth'  

export default function Login() {
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Verificar los diferentes parámetros de la URL
    if (searchParams.get('verification') === 'pending') {
      setMessage(t('login.checkEmail'))
    } else if (searchParams.get('verified') === 'true') {
      setMessage(t('login.emailVerified'))
    } else if (searchParams.get('passwordUpdated') === 'true') {
      setMessage(t('login.passwordUpdated'))
    }
  }, [searchParams, t])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      setLoading(true)
      await authService.signIn(email, password)

      // Disparar el evento de cambio de autenticación
      window.dispatchEvent(new Event('auth-state-changed'))

      // Obtener el locale actual de la URL
      const locale = window.location.pathname.split('/')[1]
      // Redirigir a platform
      window.location.href = `/${locale}/platform`
    } catch (error) {
      setError(t('login.invalidCredentials'))
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
              <img
                src="/images/logo.png"
                alt="MyApp"
                className="h-20 w-auto"
              />
            </Link>
          </div>
          <h2 className="text-3xl font-bold">{t('login.title')}</h2>
          <p className="mt-2 text-base-content/70">{t('login.subtitle')}</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="alert alert-success">
            <span>{message}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                {t('login.email')}
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                {t('login.password')}
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
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/auth/forgot-password" className="link link-primary">
                {t('login.forgotPassword')}
              </Link>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {t('login.signIn')}
          </button>

          <p className="text-center text-sm">
            {t('login.noAccount')}{' '}
            <Link href="/auth/register" className="link link-primary">
              {t('login.createAccount')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
} 