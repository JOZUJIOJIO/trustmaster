"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Locale } from "./i18n";
import { t as translate } from "./i18n";

interface LocaleContextType {
  locale: Locale;
  isChinese: boolean;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "th",
  isChinese: true,
  setLocale: () => {},
  t: (key: string) => key,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    const saved = localStorage.getItem("trustmaster-locale") as Locale | null;
    if (saved) setLocaleState(saved);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("trustmaster-locale", newLocale);
    document.documentElement.lang = newLocale === "zh" ? "zh-CN" : newLocale;
  };

  const t = (key: string) => translate(locale, key);
  const isChinese = locale === "zh" || locale === "th";

  return (
    <LocaleContext.Provider value={{ locale, isChinese, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
