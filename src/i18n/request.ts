import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const locales = ['en', 'hi', 'te', 'ta', 'kn', 'ml'] as const;
export type Locale = (typeof locales)[number];

export function isValidLocale(loc: string): loc is Locale {
  return locales.includes(loc as Locale);
}

export default getRequestConfig(async () => {
  const store = await cookies();
  const localeCookie = store.get('NEXT_LOCALE')?.value ?? store.get('locale')?.value;
  const locale = isValidLocale(localeCookie || '') ? localeCookie! : 'en';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'Asia/Kolkata',
  };
});
