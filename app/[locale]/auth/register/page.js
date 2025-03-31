'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { authService } from '../../../lib/services/auth'

export default function Register() {
  const t = useTranslations('auth')
  const router = useRouter()
  const { locale } = useParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError(t('register.passwordMismatch'))
      return
    }

    if (!acceptedTerms) {
      setError(t('register.errors.termsRequired'))
      return
    }

    try {
      setLoading(true)
      await authService.signUp(email, password)
      router.push(`/${locale}/auth/login?verification=pending`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
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
          <h2 className="text-3xl font-bold">{t('register.title')}</h2>
          <p className="mt-2 text-base-content/70">{t('register.subtitle')}</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                {t('register.email')}
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
                {t('register.password')}
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
                {t('register.confirmPassword')}
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

          {/* Checkbox de términos y condiciones */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="font-medium">
                {t('register.terms.accept')}{' '}
                <Link href={`/${locale}/terms`} className="link link-primary" target="_blank">
                  {t('register.terms.terms')}
                </Link>{' '}
                {t('register.terms.and')}{' '}
                <Link href={`/${locale}/privacy`} className="link link-primary" target="_blank">
                  {t('register.terms.privacy')}
                </Link>
              </label>
            </div>
          </div>

          <div className="text-sm text-center">
            <Link href="/auth/login" className="link link-primary">
              {t('register.alreadyHaveAccount')}
            </Link>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? t('register.creating') : t('register.createAccount')}
          </button>
        </form>
      </div>
    </div>
  )
} 