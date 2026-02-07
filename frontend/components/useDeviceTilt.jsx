"use client";

import { useEffect, useState } from "react";

// Хук для отслеживания наклона устройства (DeviceOrientation API)
export function useDeviceTilt() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Проверяем поддержку DeviceOrientation API
    if (typeof window === "undefined" || !window.DeviceOrientationEvent) {
      return;
    }

    const handleOrientation = (event) => {
      // beta: наклон вперед-назад (-180 до 180) - вертикальный наклон
      // gamma: наклон влево-вправо (-90 до 90) - горизонтальный наклон
      const beta = event.beta || 0;
      const gamma = event.gamma || 0;

      // Нормализуем значения для плавного движения по обеим осям
      // Используем gamma для X (влево-вправо) и beta для Y (вверх-вниз)
      const normalizedX = Math.max(-20, Math.min(20, gamma)); // горизонталь
      const normalizedY = Math.max(-20, Math.min(20, beta - 90)); // вертикаль (компенсируем начальное положение)

      setTilt({ x: normalizedX, y: normalizedY });
    };

    // Запрос разрешения для iOS 13+
    const requestPermission = async () => {
      if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === "granted") {
            window.addEventListener("deviceorientation", handleOrientation);
          }
        } catch (error) {
          console.error("DeviceOrientation permission denied:", error);
        }
      } else {
        // Для Android и других устройств
        window.addEventListener("deviceorientation", handleOrientation);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  return tilt;
}
