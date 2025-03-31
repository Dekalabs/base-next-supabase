// Can be imported from a shared config
const locales = ['en', 'es'];

export default async function config() {
  return {
    defaultLocale: 'en',
    locales: locales,
    locale: 'en',
    messages: async (locale) => {
      if (!locales.includes(locale)) {
        throw new Error(`Locale ${locale} not supported`);
      }
      return (await import(`./messages/${locale}.json`)).default;
    },
    timeZone: 'Europe/Madrid',
    now: new Date()
  };
}