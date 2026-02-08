// Mock next-intl hooks for testing
export const useTranslations = () => {
  return (key: string) => key;
};

export const useLocale = () => 'fr';
