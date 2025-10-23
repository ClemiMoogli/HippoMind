import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['en', 'fr'];

export default getRequestConfig(async ({ requestLocale }) => {
  // This function is always called with a locale
  let locale = await requestLocale;

  // Ensure the locale is valid
  if (!locale || !locales.includes(locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
