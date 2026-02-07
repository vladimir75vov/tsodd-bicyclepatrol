"use client";

import React, { createContext, useEffect, useState } from "react";

// Контекст для управления языком приложения (EN/RU)
export const LanguageContext = createContext({ lang: "en", setLang: () => {}, t: (k) => k });

// Все переводы интерфейса
const translations = {
  en: {
    nav: {
      contact: "Contact",
    },
    hero: {
      titleName: "TSODD Bicycle Patrol",
    },
    footer: {
      quickLinks: "Quick Links",
      follow: "Follow",
      developer: "Full Stack Developer",
      contact: "Contact",
      copyright: "All rights reserved.",
    },
    theme: {
      light: "Light mode",
      dark: "Dark mode",
    },
  },
  ru: {
    nav: {
      contact: "Контакты",
    },
    hero: {
      titleName: "TSODD Bicycle Patrol",
    },
    footer: {
      quickLinks: "Быстрые ссылки",
      follow: "Подписывайтесь",
      developer: "Full Stack Разработчик",
      contact: "Контакты",
      copyright: "Все права защищены.",
    },
    theme: {
      light: "Светлая тема",
      dark: "Тёмная тема",
    },
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");
  const [isHydrated, setIsHydrated] = useState(false);

  // Загрузка сохранённого языка из localStorage или определение языка браузера
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      // Валидация: только 'en' или 'ru'
      if (saved && (saved === 'en' || saved === 'ru')) {
        setLang(saved);
      } else {
        // Определяем язык браузера
        const browserLang = navigator.language || navigator.userLanguage;
        const detectedLang = browserLang.toLowerCase().startsWith('ru') ? 'ru' : 'en';
        setLang(detectedLang);
        localStorage.setItem("lang", detectedLang);
      }
    } catch (e) {
      // При ошибке устанавливаем английский по умолчанию
      setLang('en');
    }
    setIsHydrated(true);
  }, []);

  // Сохранение выбранного языка в localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("lang", lang);
    } catch (e) {}
  }, [lang, isHydrated]);

  // Функция перевода: принимает путь (например "nav.about"), возвращает перевод
  function t(path) {
    const parts = path.split(".");
    let cur = translations[lang] || translations.en;
    for (const p of parts) {
      if (cur[p] == null) return path;
      cur = cur[p];
    }
    return cur;
  }

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}
