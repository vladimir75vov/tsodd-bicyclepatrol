"use client";

import React, { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => {},
  christmasMode: false,
  setChristmasMode: () => {},
  autumnMode: false,
  setAutumnMode: () => {},
});

// Функция определения текущего сезона для России
function getCurrentSeason() {
  const now = new Date();
  const month = now.getMonth(); // 0-11

  // Зима: декабрь (11), январь (0), февраль (1)
  if (month === 11 || month === 0 || month === 1) {
    return 'winter';
  }
  // Весна: март (2), апрель (3), май (4)
  if (month >= 2 && month <= 4) {
    return 'spring';
  }
  // Лето: июнь (5), июль (6), август (7)
  if (month >= 5 && month <= 7) {
    return 'summer';
  }
  // Осень: сентябрь (8), октябрь (9), ноябрь (10)
  if (month >= 8 && month <= 10) {
    return 'autumn';
  }
  return null;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [christmasMode, setChristmasMode] = useState(false);
  const [autumnMode, setAutumnMode] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      // Валидация: только 'light' или 'dark'
      if (saved && (saved === "light" || saved === "dark")) {
        setTheme(saved);
      } else if (saved !== null) {
        // Если значение некорректное, удаляем его и используем по умолчанию
        localStorage.removeItem("theme");
      }

      // Проверяем, есть ли сохраненные настройки сезонных тем
      const savedChristmas = localStorage.getItem("christmasMode");
      const savedAutumn = localStorage.getItem("autumnMode");

      // Если пользователь ранее не выбирал тему, устанавливаем автоматически по сезону
      if (savedChristmas === null && savedAutumn === null) {
        const currentSeason = getCurrentSeason();
        if (currentSeason === 'winter') {
          setChristmasMode(true);
          setAutumnMode(false);
        } else if (currentSeason === 'autumn') {
          setChristmasMode(false);
          setAutumnMode(true);
        } else {
          setChristmasMode(false);
          setAutumnMode(false);
        }
      } else {
        // Если есть сохраненные настройки, используем их с валидацией
        if (savedChristmas !== null) {
          // Валидация: только 'true' или 'false'
          if (savedChristmas === "true" || savedChristmas === "false") {
            setChristmasMode(savedChristmas === "true");
          } else {
            localStorage.removeItem("christmasMode");
            setChristmasMode(false);
          }
        }
        if (savedAutumn !== null) {
          // Валидация: только 'true' или 'false'
          if (savedAutumn === "true" || savedAutumn === "false") {
            setAutumnMode(savedAutumn === "true");
          } else {
            localStorage.removeItem("autumnMode");
            setAutumnMode(false);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load theme:", e);
      // При ошибке устанавливаем безопасные значения по умолчанию
      setTheme("dark");
      setChristmasMode(false);
      setAutumnMode(false);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      localStorage.setItem("theme", theme);

      // Обновление класса документа для CSS переменных
      if (theme === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      }
    } catch (e) {
      console.error("Failed to save theme:", e);
    }
  }, [theme, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      localStorage.setItem("christmasMode", christmasMode.toString());

      // Добавление/удаление класса новогодней темы
      if (christmasMode) {
        document.documentElement.classList.add("christmas-theme");
        document.documentElement.classList.remove("autumn-theme");
      } else {
        document.documentElement.classList.remove("christmas-theme");
      }
    } catch (e) {
      console.error("Failed to save christmas mode:", e);
    }
  }, [christmasMode, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    try {
      localStorage.setItem("autumnMode", autumnMode.toString());

      // Добавление/удаление класса осенней темы
      if (autumnMode) {
        document.documentElement.classList.add("autumn-theme");
        document.documentElement.classList.remove("christmas-theme");
      } else {
        document.documentElement.classList.remove("autumn-theme");
      }
    } catch (e) {
      console.error("Failed to save autumn mode:", e);
    }
  }, [autumnMode, isHydrated]);

  return <ThemeContext.Provider value={{ theme, setTheme, christmasMode, setChristmasMode, autumnMode, setAutumnMode }}>{children}</ThemeContext.Provider>;
}
