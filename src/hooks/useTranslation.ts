import { useLanguage } from "../aspects/LanguageContext";

export const useTranslation = () => {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  return { language, setLanguage, toggleLanguage, t };
};

export default useTranslation;
