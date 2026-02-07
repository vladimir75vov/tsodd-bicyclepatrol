"use client";

import { useContext, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";

// Компонент для динамического изменения цвета браузера
export default function ThemeColor() {
  const { theme, christmasMode, autumnMode } = useContext(ThemeContext);

  useEffect(() => {
    // Получаем meta тег theme-color
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    // Если нет, создаем
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }

    // Определяем цвет в зависимости от темы
    let color = '#13151a'; // По умолчанию темная тема

    if (christmasMode) {
      color = theme === 'light' ? '#f0f8f0' : '#0a1a0f'; // Зеленоватые оттенки
    } else if (autumnMode) {
      color = theme === 'light' ? '#fff5f0' : '#1a0f0a'; // Коричневатые оттенки
    } else {
      color = theme === 'light' ? '#f8f9fa' : '#13151a'; // Обычные оттенки
    }

    metaThemeColor.content = color;
  }, [theme, christmasMode, autumnMode]);

  return null;
}
