import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import tr from "../config/translations/tr.json";
import en from "../config/translations/en.json";

export type Language = "tr" | "en";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
};

const translations: Record<Language, Record<string, string>> = { tr, en };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return saved === "en" ? "en" : "tr"; // Default to "tr"
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === "tr" ? "en" : "tr");
  };

  const t = (key: string, fallback?: string): string => {
    const dict = translations[language];
    if (dict && dict[key]) {
      return dict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
};
