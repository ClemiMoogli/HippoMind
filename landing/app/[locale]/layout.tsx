import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'en' | 'fr')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <title>HippoMind - Your Mind Maps, 100% Offline</title>
        <meta name="description" content="The mind mapping app that respects your privacy. No subscription, no cloud, just you and your ideas." />
        <meta property="og:title" content="HippoMind - Your Mind Maps, 100% Offline" />
        <meta property="og:description" content="The mind mapping app that respects your privacy. No subscription, no cloud, just you and your ideas." />
        <meta property="og:url" content="https://hippomind.org" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://hippomind.org/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HippoMind - Your Mind Maps, 100% Offline" />
        <meta name="twitter:description" content="The mind mapping app that respects your privacy. No subscription, no cloud, just you and your ideas." />
        <meta name="twitter:image" content="https://hippomind.org/og-image.png" />
        <link rel="canonical" href="https://hippomind.org" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
