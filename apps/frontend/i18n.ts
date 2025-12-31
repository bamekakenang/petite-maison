import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Limit locales to those with message files present
export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Fallback to English if missing
  let messages: any;
  try {
    messages = (await import(`./messages/${locale}.json`)).default;
  } catch {
    messages = (await import(`./messages/en.json`)).default;
  }

  return { messages };
});
