import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale: localeParam }) => {
  const locale = localeParam || 'fr';
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
