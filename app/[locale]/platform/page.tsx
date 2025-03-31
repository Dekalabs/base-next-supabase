'use client'

import { useTranslations } from 'next-intl'

export default function PlatformPage() {
  const t = useTranslations('platform')

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        {t('title')}
      </h1>
    </div>
  )
} 