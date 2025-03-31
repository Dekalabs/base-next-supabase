import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import Navbar from './components/Navbar';
import '../globals.css';

export function generateStaticParams() {
  return ['en', 'es'].map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;
  if (!['en', 'es'].includes(locale)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <html lang={locale} data-theme="nord">
      <body className="min-h-screen bg-base-100">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 