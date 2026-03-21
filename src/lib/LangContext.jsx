// src/lib/LangContext.jsx — Language context for EN / MY / ZH / TH
import { createContext, useContext, useState, useCallback } from 'react';
import strings from './translations';

const STORAGE_KEY = 'fintrack_lang';

const LangContext = createContext(null);

export const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇺🇸' },
  { code: 'my', label: 'မြန်မာ',    flag: '🇲🇲' },
  { code: 'zh', label: '中文',      flag: '🇨🇳' },
  { code: 'th', label: 'ภาษาไทย', flag: '🇹🇭' },
];

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'en'
  );

  const setLang = useCallback((code) => {
    localStorage.setItem(STORAGE_KEY, code);
    setLangState(code);
  }, []);

  // t(key) — returns translated string, falls back to English
  const t = useCallback((key) => {
    return strings[lang]?.[key] ?? strings['en']?.[key] ?? key;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t, LANGUAGES }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
