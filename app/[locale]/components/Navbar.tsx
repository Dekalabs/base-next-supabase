'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { authService } from '../../lib/services/auth'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('common')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await authService.getCurrentUser()
        setIsLoggedIn(!!user)
      } catch {
        setIsLoggedIn(false)
      }
    }
    
    checkUser()
  }, [])

  const switchLocale = () => {
    const newLocale = locale === 'en' ? 'es' : 'en'
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
  }

  const handleSignOut = async () => {
    try {
      await authService.signOut()
      setIsLoggedIn(false)
      router.push(`/${locale}`)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link href={`/${locale}`} className="btn btn-ghost text-xl">
          MyApp
        </Link>
      </div>
      <div className="flex-none gap-2">
        <button 
          onClick={switchLocale}
          className="btn btn-ghost"
        >
          {locale === 'en' ? '🇪🇸 ES' : '🇬🇧 EN'}
        </button>
        {isLoggedIn ? (
          <button 
            onClick={handleSignOut}
            className="btn btn-primary"
          >
            {t('signOut')}
          </button>
        ) : (
          <Link 
            href={`/${locale}/auth/login`} 
            className="btn btn-primary"
          >
            {t('signIn')}
          </Link>
        )}
      </div>
    </div>
  )
} 