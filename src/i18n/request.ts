import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const locales = ['en', 'hi', 'te', 'ta', 'kn', 'ml'] as const;
export type Locale = (typeof locales)[number];

export function isValidLocale(loc: string): loc is Locale {
  return locales.includes(loc as Locale);
}

// Static imports so Next always bundles messages and we never
// hit missing `_rsc_messages_*.js` chunks at runtime.
import en from '../../messages/en.json';
import hi from '../../messages/hi.json';
import te from '../../messages/te.json';
import ta from '../../messages/ta.json';
import kn from '../../messages/kn.json';
import ml from '../../messages/ml.json';

const MESSAGES: Record<Locale, Record<string, any>> = { en, hi, te, ta, kn, ml };

export default getRequestConfig(async () => {
  const store = await cookies();
  const localeCookie = store.get('NEXT_LOCALE')?.value ?? store.get('locale')?.value;
  const locale: Locale = isValidLocale(localeCookie ?? '') ? (localeCookie as Locale) : 'en';

  return {
    locale,
    messages: MESSAGES[locale],
    timeZone: 'Asia/Kolkata',
  };
});
