"use client";

import React, { useState, useEffect, useRef } from "react";

export default function ReportForm() {
  // Config states
  const [showConfig, setShowConfig] = useState(false);
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [googleScriptUrl, setGoogleScriptUrl] = useState("");
  const [configSaved, setConfigSaved] = useState(false);

  // Form states
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null); // { lat, lon }
  const [operator, setOperator] = useState("");
  const [totalBikes, setTotalBikes] = useState(0);
  const [corrosion, setCorrosion] = useState(0);
  const [bagContamination, setBagContamination] = useState(0);
  const [foreignObjects, setForeignObjects] = useState(0);
  const [bikeNumbers, setBikeNumbers] = useState(0);
  const [bagNumbers, setBagNumbers] = useState(0);
  const [appearanceSum, setAppearanceSum] = useState(0);
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [status, setStatus] = useState("");
  const [locating, setLocating] = useState(false);
  const [captureMode, setCaptureMode] = useState("upload"); // 'upload' or 'camera'
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayAnimRef = useRef(null);
  const [zoom, setZoom] = useState(1); // digital zoom for preview and capture
  const [facingMode, setFacingMode] = useState("environment"); // 'environment' (back) or 'user' (front)

  const OPERATORS = [
    "ВкусВилл",
    "Кухня на районе",
    "Яндекс (Яндекс лавка, Ультима)",
    "Самокат",
    "Сбермаркет (Купер)",
    "Озон",
    "Деливери",
    "Перекресток",
    "X5 (пятерочка и т.д.)",
    "Милти",
    "Вкусно и быстро",
    "додо",
    "Папа Джонс",
    "Алло пицца",
    "Доминос",
    "Магнит",
    "Пицца Суши Вок",
    "Много лосося",
    "Азбука вкуса",
    "Другое",
  ];

  // Load config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("reportConfig");
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setTelegramToken(config.telegramToken || "");
        setTelegramChatId(config.telegramChatId || "");
        setGoogleScriptUrl(config.googleScriptUrl || "");
        setConfigSaved(!!config.telegramToken);
      } catch (e) {
        console.error("Error loading config:", e);
      }
    }
  }, []);

  // Save config to localStorage
  const saveConfig = () => {
    if (!telegramToken || !telegramChatId) {
      setStatus("⚠️ Укажите токен Telegram и Chat ID");
      return;
    }
    const config = {
      telegramToken,
      telegramChatId,
      googleScriptUrl,
    };
    localStorage.setItem("reportConfig", JSON.stringify(config));
    setConfigSaved(true);
    setShowConfig(false);
    setStatus("✓ Конфигурация сохранена");
    setTimeout(() => setStatus(""), 3000);
  };

  const handleFiles = (e) => {
    const chosen = Array.from(e.target.files || []);
    processAndAddFiles(chosen);
  };

  // process files by adding watermark (address + time) before storing
  const processAndAddFiles = async (fileList) => {
    // For user-uploaded files we DO NOT apply watermark — only camera captures get watermarks.
    const newFiles = fileList.map((f) => f);
    const newUrls = fileList.map((f) => URL.createObjectURL(f));
    setFiles((prev) => [...prev, ...newFiles]);
    setPreviewUrls((prev) => [...prev, ...newUrls]);
  };

  const watermarkFile = (file, addrParam = null, coordsParam = null) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const maxW = 1200;
          let w = img.width;
          let h = img.height;
          if (w > maxW) {
            const ratio = maxW / w;
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          // watermark background (include coordinates if available)
          const useCoords = coordsParam || coords;
          const coordsStr = useCoords ? `${useCoords.lat.toFixed(5)}, ${useCoords.lon.toFixed(5)}` : null;
          const addrPart = addrParam || address || "Адрес не определён";
          const text = `${addrPart}${coordsStr ? ` (${coordsStr})` : ""} — ${new Date().toLocaleString()}`;
          ctx.font = `${Math.max(14, Math.round(w / 60))}px sans-serif`;
          const padding = 8;
          const metrics = ctx.measureText(text);
          const textWidth = metrics.width;
          const textHeight = Math.max(18, Math.round(w / 60));
          const x = 10;
          const y = h - 10;
          ctx.fillStyle = "rgba(0,0,0,0.45)";
          ctx.fillRect(x - padding / 2, y - textHeight - padding / 2, textWidth + padding, textHeight + padding / 2);
          ctx.fillStyle = "#fff";
          ctx.fillText(text, x, y - 6);
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error("Blob error"));
            const newFile = new File([blob], file.name, { type: blob.type });
            resolve(newFile);
          }, "image/jpeg", 0.85);
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    // set default date to today
    if (!date) {
      const today = new Date().toISOString().slice(0, 10);
      setDate(today);
    }
  }, [date]);

  useEffect(() => {
    // auto-calc appearance sum as simple sum of numeric issues
    const sum = Number(corrosion || 0) + Number(bagContamination || 0) + Number(foreignObjects || 0);
    setAppearanceSum(sum);
  }, [corrosion, bagContamination, foreignObjects]);

  // Zoom control via pinch gesture and volume buttons
  useEffect(() => {
    if (!cameraActive) return;

    const videoElement = videoRef.current;
    let touchStartDistance = 0;

    // Pinch to zoom (touchmove)
    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDistance = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        
        if (touchStartDistance > 0) {
          const ratio = currentDistance / touchStartDistance;
          const newZoom = Math.min(3, Math.max(1, zoom * ratio));
          setZoom(newZoom);
          touchStartDistance = currentDistance;
        }
      }
    };

    const handleTouchEnd = () => {
      touchStartDistance = 0;
    };

    // Volume buttons for zoom
    const handleKeyDown = (e) => {
      // Android volume buttons: VolumeUp, VolumeDown
      if (e.code === 'VolumeUp' || e.key === 'VolumeUp') {
        e.preventDefault();
        setZoom((z) => Math.min(3, z + 0.2));
      } else if (e.code === 'VolumeDown' || e.key === 'VolumeDown') {
        e.preventDefault();
        setZoom((z) => Math.max(1, z - 0.2));
      }
    };

    if (videoElement) {
      videoElement.addEventListener('touchstart', handleTouchStart, { passive: false });
      videoElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      videoElement.addEventListener('touchend', handleTouchEnd);
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('touchstart', handleTouchStart);
        videoElement.removeEventListener('touchmove', handleTouchMove);
        videoElement.removeEventListener('touchend', handleTouchEnd);
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [cameraActive, zoom]);

  // Camera control
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        // start overlay draw loop
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas && video) {
          const ctx = canvas.getContext("2d");
          const resize = () => {
            try {
              canvas.width = video.videoWidth || video.clientWidth || 640;
              canvas.height = video.videoHeight || video.clientHeight || 480;
            } catch (e) {}
          };

          const draw = () => {
            try {
              resize();
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              // draw translucent background bar
                const coordsStr = coords ? `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}` : null;
                const addrPart = address || "Адрес не определён";
                const text = `${addrPart}${coordsStr ? ` (${coordsStr})` : ""} — ${new Date().toLocaleString()}`;
                ctx.font = `${Math.max(14, Math.round(canvas.width / 45))}px sans-serif`;
              ctx.fillStyle = "rgba(0,0,0,0.35)";
              const metrics = ctx.measureText(text);
              const padding = 12;
              const x = 10;
              const y = canvas.height - 10;
              const textWidth = metrics.width;
              const textHeight = Math.max(18, Math.round(canvas.width / 45));
              ctx.fillRect(x - padding / 2, y - textHeight - padding / 2, textWidth + padding, textHeight + padding / 2);
              ctx.fillStyle = "#fff";
              ctx.fillText(text, x, y - 6);
            } catch (e) {
              // ignore
            }
            overlayAnimRef.current = requestAnimationFrame(draw);
          };
          overlayAnimRef.current = requestAnimationFrame(draw);
        }
      }
    } catch (err) {
      setStatus("Не удалось открыть камеру: " + err.message);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    // stop overlay loop
    if (overlayAnimRef.current) {
      cancelAnimationFrame(overlayAnimRef.current);
      overlayAnimRef.current = null;
    }
    // clear overlay canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx && ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const w = video.videoWidth || video.clientWidth || 640;
    const h = video.videoHeight || video.clientHeight || 480;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    // apply digital zoom by cropping the center of the video frame
    const z = Math.max(1, Number(zoom) || 1);
    try {
      if (z > 1 && video.videoWidth && video.videoHeight) {
        const sw = Math.floor(video.videoWidth / z);
        const sh = Math.floor(video.videoHeight / z);
        const sx = Math.floor((video.videoWidth - sw) / 2);
        const sy = Math.floor((video.videoHeight - sh) / 2);
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, w, h);
      } else {
        ctx.drawImage(video, 0, 0, w, h);
      }
    } catch (err) {
      // fallback
      ctx.drawImage(video, 0, 0, w, h);
    }
    // add watermark (date, time, address)
    const coordsStr = coords ? `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}` : null;
    const addrPart = address || "Адрес не определён";
    const text = `${addrPart}${coordsStr ? ` (${coordsStr})` : ""} — ${new Date().toLocaleString()}`;
    ctx.font = `${Math.max(18, Math.round(w / 40))}px sans-serif`;
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    const metrics = ctx.measureText(text);
    const textW = metrics.width;
    const padding = 12;
    const x = 10;
    const y = h - 10;
    ctx.fillRect(x - padding / 2, y - 40, textW + padding, 44);
    ctx.fillStyle = "#fff";
    ctx.fillText(text, x, y - 14);
    canvas.toBlob((blob) => {
      if (!blob) return setStatus("Не удалось захватить изображение");
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: blob.type });
      setFiles((prev) => [...prev, file]);
      setPreviewUrls((prev) => [...prev, URL.createObjectURL(file)]);
    }, "image/jpeg", 0.9);
  };

  const determineLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation не поддерживается");
      return;
    }
    setLocating(true);
    setStatus("Определяем местоположение...");
        navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
            setCoords({ lat: latitude, lon: longitude });
        setStatus("Определяем адрес по координатам...");
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { "User-Agent": "BicyclePatrol/1.0" } }
          );
          if (r.ok) {
            const json = await r.json();
            setAddress(json.display_name || `${latitude}, ${longitude}`);
            setStatus("Адрес определён — при необходимости отредактируйте");
          } else {
            setAddress(`${latitude}, ${longitude}`);
            setStatus("Не удалось получить адрес, сохранены координаты");
          }
        } catch (err) {
          setAddress(`${latitude}, ${longitude}`);
          setStatus("Ошибка при обратном геокодировании");
        }
        setLocating(false);
      },
      (err) => {
        setStatus("Ошибка определения местоположения: " + err.message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация формы
    if (!address.trim()) {
      setStatus("⚠️ Ошибка: не указан адрес");
      return;
    }
    if (!operator || operator === "") {
      setStatus("⚠️ Ошибка: не выбран оператор");
      return;
    }
    if (files.length === 0) {
      setStatus("⚠️ Ошибка: не загружено ни одной фотографии");
      return;
    }

    // Check if config is set
    if (!telegramToken || !telegramChatId) {
      setStatus("⚠️ Ошибка: не настроена конфигурация. Нажмите на ⚙️");
      setShowConfig(true);
      return;
    }

    setStatus("📤 Отправка...");
    try {
      const fd = new FormData();
      fd.append("date", date);
      fd.append("address", address);
      fd.append("operator", operator);
      fd.append("totalBikes", String(totalBikes));
      fd.append("corrosion", corrosion);
      fd.append("bagContamination", bagContamination);
      fd.append("foreignObjects", foreignObjects);
      fd.append("bikeNumbers", bikeNumbers);
      fd.append("bagNumbers", bagNumbers);
      fd.append("appearanceSum", String(appearanceSum));
      files.forEach((f, i) => fd.append("photos", f, f.name));

      // Save to localStorage
      const reportData = {
        date, address, operator, totalBikes, corrosion, bagContamination, foreignObjects, bikeNumbers, bagNumbers, appearanceSum, timestamp: new Date().toISOString()
      };
      const savedReports = JSON.parse(localStorage.getItem("reports") || "[]");
      savedReports.push(reportData);
      localStorage.setItem("reports", JSON.stringify(savedReports));

      // Send to Google Sheets via Apps Script
      let sheetsStatus = false;
      if (googleScriptUrl) {
        try {
          await fetch(googleScriptUrl, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(reportData),
          });
          sheetsStatus = true;
        } catch (err) {
          console.error("Google Sheets error:", err);
        }
      }

      // Send to Telegram
      let telegramStatus = false;
      const token = telegramToken;
      const chatId = telegramChatId;

      if (!token || !chatId) {
        const statusMsg = sheetsStatus 
          ? "✓ Данные отправлены в Гугл таблицу\n⚠️ Telegram не настроен" 
          : "✓ Данные сохранены локально\n⚠️ Telegram не настроен";
        setStatus(statusMsg);
        // clear form
        setDate(new Date().toISOString().slice(0, 10));
        setAddress("");
        setOperator("");
        setTotalBikes(0);
        setCorrosion(0);
        setBagContamination(0);
        setForeignObjects(0);
        setBikeNumbers(0);
        setBagNumbers(0);
        setAppearanceSum(0);
        setFiles([]);
        setPreviewUrls([]);
        return;
      }

      // Build text message
      const textLines = [
        `📋 Отчёт о велосипедах`,
        `Дата: ${date}`,
        `Адрес: ${address}`,
        `Оператор: ${operator}`,
        `Всего велосипедов: ${totalBikes}`,
        `Коррозия: ${corrosion}`,
        `Загрязнение сумок: ${bagContamination}`,
        `Посторонние предметы: ${foreignObjects}`,
        `Номера на велосипедах: ${bikeNumbers}`,
        `Номера на сумках: ${bagNumbers}`,
        `Сумма по внешнему виду: ${appearanceSum}`,
      ];
      const text = textLines.join("\n");

      // If no photos, send simple message
      if (files.length === 0) {
        try {
          const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: String(chatId), text, parse_mode: "HTML" }),
          });
          const resData = await res.json();
          if (res.ok) {
            telegramStatus = true;
            const sheets = sheetsStatus ? "✓ Гугл таблица" : "✗ Гугл таблица";
            const telegram = telegramStatus ? "✓ Telegram" : "✗ Telegram";
            setStatus(`Отправлено:\n${sheets}\n${telegram}`);
            // clear form
            setDate(new Date().toISOString().slice(0, 10));
            setAddress("");
            setOperator("");
            setTotalBikes(0);
            setCorrosion(0);
            setBagContamination(0);
            setForeignObjects(0);
            setBikeNumbers(0);
            setBagNumbers(0);
            setAppearanceSum(0);
            setFiles([]);
            setPreviewUrls([]);
          } else {
            console.error("Telegram error:", resData);
            setStatus(`⚠ Ошибка Telegram: ${resData?.description || "неизвестная ошибка"} (данные сохранены)`);
          }
        } catch (e) {
          console.error("Fetch error:", e);
          setStatus("⚠ Ошибка подключения (данные сохранены)");
        }
        return;
      }

      // If photos exist, send first batch (up to 10) with text, rest as replies
      try {
        let replyToMessageId = null;

        if (files.length === 0) {
          // No photos, just send text
          const textRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: String(chatId), text }),
          });
          const textResData = await textRes.json();
          if (textRes.ok) {
            setStatus("✓ Успешно отправлено в Telegram");
            setDate(new Date().toISOString().slice(0, 10));
            setAddress("");
            setOperator("");
            setTotalBikes(0);
            setCorrosion(0);
            setBagContamination(0);
            setForeignObjects(0);
            setBikeNumbers(0);
            setBagNumbers(0);
            setAppearanceSum(0);
            setFiles([]);
            setPreviewUrls([]);
          } else {
            setStatus("⚠ Ошибка при отправке");
          }
          return;
        }

        // With photos: send first batch (up to 10) with caption
        if (files.length === 1) {
          // Single photo with caption
          const formDataTg = new FormData();
          formDataTg.append("chat_id", String(chatId));
          formDataTg.append("caption", text);
          formDataTg.append("photo", files[0], files[0].name);

          const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
            method: "POST",
            body: formDataTg,
          });
          const resData = await res.json();
          if (res.ok && resData.result && resData.result.message_id) {
            replyToMessageId = resData.result.message_id;
            telegramStatus = true;
          } else {
            console.error("Failed to send photo:", resData);
            setStatus("⚠ Ошибка при отправке фото");
            return;
          }
        } else {
          // Multiple photos: send first batch (up to 10) as media group with caption
          const firstBatchSize = Math.min(files.length, 10);
          const formDataTg = new FormData();
          formDataTg.append("chat_id", String(chatId));
          
          const media = [];
          for (let i = 0; i < firstBatchSize; i++) {
            const fieldName = `photo${i}`;
            formDataTg.append(fieldName, files[i], files[i].name);
            if (i === 0) {
              // Only first photo has caption
              media.push({ type: "photo", media: `attach://${fieldName}`, caption: text });
            } else {
              media.push({ type: "photo", media: `attach://${fieldName}` });
            }
          }
          formDataTg.append("media", JSON.stringify(media));

          const res = await fetch(`https://api.telegram.org/bot${token}/sendMediaGroup`, {
            method: "POST",
            body: formDataTg,
          });
          const resData = await res.json();
          if (res.ok && resData.result && resData.result[0] && resData.result[0].message_id) {
            replyToMessageId = resData.result[0].message_id;
            telegramStatus = true;
            console.log("First batch sent, ID:", replyToMessageId);
          } else {
            console.error("Failed to send first batch:", resData);
            setStatus("⚠ Ошибка при отправке первой группы фото");
            return;
          }
        }

        // Send remaining photos (if any) as reply
        if (files.length > 10) {
          let sentCount = 10; // Already sent first 10
          
          // Process remaining photos in groups of 10
          for (let startIdx = 10; startIdx < files.length; startIdx += 10) {
            const endIdx = Math.min(startIdx + 10, files.length);
            const batchFiles = files.slice(startIdx, endIdx);
            
            const formDataTg = new FormData();
            formDataTg.append("chat_id", String(chatId));
            formDataTg.append("reply_to_message_id", String(replyToMessageId));
            
            const media = [];
            for (let i = 0; i < batchFiles.length; i++) {
              const fieldName = `photo${i}`;
              formDataTg.append(fieldName, batchFiles[i], batchFiles[i].name);
              media.push({ type: "photo", media: `attach://${fieldName}` });
            }
            formDataTg.append("media", JSON.stringify(media));

            const res = await fetch(`https://api.telegram.org/bot${token}/sendMediaGroup`, {
              method: "POST",
              body: formDataTg,
            });
            const resData = await res.json();
            if (res.ok) {
              sentCount += batchFiles.length;
              console.log(`Sent reply batch: ${batchFiles.length} photos`);
            } else {
              console.error("Telegram error on batch:", resData);
              setStatus(`⚠ Ошибка при отправке группы фото: ${resData?.description || "неизвестная ошибка"}`);
              return;
            }
          }
          
          telegramStatus = true;
        } else if (files.length > 1) {
          telegramStatus = true;
        }

        // Show final status
        const sheets = sheetsStatus ? "✓ Гугл таблица" : "✗ Гугл таблица";
        const telegram = telegramStatus ? "✓ Telegram" : "✗ Telegram";
        setStatus(`Отправлено:\n${sheets}\n${telegram}`);

        // Clear form
        setDate(new Date().toISOString().slice(0, 10));
        setAddress("");
        setOperator("");
        setTotalBikes(0);
        setCorrosion(0);
        setBagContamination(0);
        setForeignObjects(0);
        setBikeNumbers(0);
        setBagNumbers(0);
        setAppearanceSum(0);
        setFiles([]);
        setPreviewUrls([]);
      } catch (e) {
        console.error("Fetch error:", e);
        setStatus("⚠ Ошибка подключения (данные сохранены)");
      }
    } catch (err) {
      setStatus("⚠ Ошибка: " + err.message + " (данные сохранены)");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-[var(--card-bg)] p-3 md:p-6 rounded-lg shadow-sm overflow-x-hidden">
      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Форма осмотра велосипеда</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <label className="flex flex-col">
          <span className="text-sm md:text-base">Дата</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 p-2 rounded bg-transparent border text-sm" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm md:text-base">Адрес</span>
          <div className="flex flex-col md:flex-row gap-2 mt-1">
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Адрес или координаты" className="flex-1 p-2 rounded bg-transparent border text-sm" />
            <button type="button" onClick={determineLocation} disabled={locating} className="px-2 md:px-3 py-2 bg-gray-700 text-white rounded text-xs md:text-sm whitespace-nowrap">
              {locating ? "Определяем..." : "GPS"}
            </button>
          </div>
        </label>

        <label className="flex flex-col">
          <span className="text-sm md:text-base">Оператор</span>
          <select value={operator} onChange={(e) => setOperator(e.target.value)} className="mt-1 p-2 rounded bg-transparent border text-sm">
            <option value="">-- выберите операторa --</option>
            {OPERATORS.map((op) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col">
          <span className="text-sm md:text-base">Всего велосипедов</span>
          <input type="number" value={totalBikes} onChange={(e) => setTotalBikes(Number(e.target.value))} className="mt-1 p-2 rounded bg-transparent border text-sm" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm md:text-base">Коррозия (число)</span>
          <input type="number" min="0" value={corrosion} onChange={(e) => setCorrosion(Number(e.target.value))} className="mt-1 p-2 rounded bg-transparent border text-sm" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm md:text-base">Загрязнение сумок (число)</span>
          <input type="number" min="0" value={bagContamination} onChange={(e) => setBagContamination(Number(e.target.value))} className="mt-1 p-2 rounded bg-transparent border text-sm" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm md:text-base">Посторонние предметы (число)</span>
          <input type="number" min="0" value={foreignObjects} onChange={(e) => setForeignObjects(Number(e.target.value))} className="mt-1 p-2 rounded bg-transparent border text-sm" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm md:text-base">Номера велосипедов (число)</span>
          <input type="number" min="0" value={bikeNumbers} onChange={(e) => setBikeNumbers(Number(e.target.value))} className="mt-1 p-2 rounded bg-transparent border text-sm" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm md:text-base">Номера сумок (число)</span>
          <input type="number" min="0" value={bagNumbers} onChange={(e) => setBagNumbers(Number(e.target.value))} className="mt-1 p-2 rounded bg-transparent border text-sm" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm md:text-base">Сумма внешний вид (авто)</span>
          <input type="number" value={appearanceSum} readOnly className="mt-1 p-2 rounded bg-transparent border text-sm" />
        </label>

        <div className="flex flex-col md:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <label className="flex items-center gap-2 text-sm md:text-base">
              <input type="radio" name="captureMode" value="upload" checked={captureMode === "upload"} onChange={() => { setCaptureMode("upload"); stopCamera(); }} />
              Загрузить фото
            </label>
            <label className="flex items-center gap-2 text-sm md:text-base">
              <input type="radio" name="captureMode" value="camera" checked={captureMode === "camera"} onChange={() => { setCaptureMode("camera"); }} />
              Сделать фото
            </label>
          </div>

          {captureMode === "upload" && (
            <label className="flex flex-col mt-2">
              <span className="text-sm md:text-base">Фотографии</span>
              <input type="file" accept="image/*" multiple onChange={handleFiles} className="mt-1 p-2 rounded bg-transparent border text-sm" />
            </label>
          )}

          {captureMode === "camera" && (
            <div className="mt-2">
              {!cameraActive && (
                <div className="flex flex-col md:flex-row gap-2">
                  <button type="button" onClick={startCamera} className="px-3 py-2 bg-blue-600 text-white rounded text-sm flex-1 md:flex-none">Открыть камеру</button>
                  <button type="button" onClick={() => { setFiles([]); setPreviewUrls([]); }} className="px-3 py-2 bg-gray-600 text-white rounded text-sm flex-1 md:flex-none">Очистить</button>
                </div>
              )}
                            <div className="mt-3">
                            <div className="bg-black rounded overflow-hidden">
                                <div className="relative">
                                  <video ref={videoRef} style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }} className={`w-full max-h-96 object-cover ${cameraActive ? '' : 'hidden'}`} />
                                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 mt-2">
                              <div className="flex flex-col md:flex-row md:items-center gap-2">
                                <label className="flex items-center gap-2 text-xs md:text-sm">
                                  <span>Камера:</span>
                                  <select value={facingMode} onChange={(e) => { setFacingMode(e.target.value); if (cameraActive) { stopCamera(); setTimeout(() => startCamera(), 300); } }} className="p-1 rounded bg-transparent border text-xs">
                                    <option value="environment">Задняя</option>
                                    <option value="user">Фронтальная</option>
                                  </select>
                                </label>
                                <label className="flex items-center gap-2 text-xs md:text-sm">
                                  <span>Зум: <span className="font-medium">{zoom.toFixed(1)}x</span></span>
                                  <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-20 md:w-24" />
                                </label>
                              </div>
                              <div className="flex gap-2">
                                <button type="button" onClick={capturePhoto} disabled={!cameraActive} className="px-3 py-2 bg-green-600 text-white rounded flex-1 text-sm">Снять</button>
                                <button type="button" onClick={stopCamera} disabled={!cameraActive} className="px-3 py-2 bg-red-600 text-white rounded flex-1 text-sm">Завершить</button>
                              </div>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] mt-2">Можно сделать сколько угодно снимков; они добавятся в превью и будут загружены при отправке.</p>
                          </div>
            </div>
          )}
        </div>
      </div>

      {previewUrls.length > 0 && (
        <div className="mt-4">
          <div className="hidden md:grid md:grid-cols-3 md:gap-2">
            {previewUrls.map((u, i) => (
              <img key={i} src={u} alt={`preview-${i}`} onClick={() => { setViewerIndex(i); setShowViewer(true); }} className="w-full h-32 object-cover rounded cursor-pointer" />
            ))}
          </div>
          <div className="md:hidden flex gap-2 overflow-x-auto py-1">
            {previewUrls.map((u, i) => (
              <img key={i} src={u} alt={`preview-${i}`} onClick={() => { setViewerIndex(i); setShowViewer(true); }} className="w-40 h-28 object-cover rounded cursor-pointer flex-shrink-0" />
            ))}
          </div>
        </div>
      )}

      {/* Photo viewer modal */}
      {showViewer && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="max-w-full max-h-full w-full md:w-3/4 relative">
            <button onClick={() => setShowViewer(false)} className="absolute top-2 right-2 z-10 bg-gray-700 text-white px-3 py-1 rounded">✕</button>
            <button onClick={() => { setViewerIndex((i) => (i - 1 + previewUrls.length) % previewUrls.length); }} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-gray-700 text-white px-3 py-1 rounded">◀</button>
            <button onClick={() => { setViewerIndex((i) => (i + 1) % previewUrls.length); }} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-gray-700 text-white px-3 py-1 rounded">▶</button>
            <button onClick={() => {
              // delete current photo
              const idx = viewerIndex;
              setFiles((prev) => prev.filter((_, j) => j !== idx));
              setPreviewUrls((prev) => {
                const next = prev.filter((_, j) => j !== idx);
                if (next.length === 0) {
                  setShowViewer(false);
                } else {
                  setViewerIndex((v) => Math.max(0, Math.min(next.length - 1, v >= idx ? v - 1 : v)));
                }
                return next;
              });
            }} className="absolute bottom-4 right-4 z-10 bg-red-600 text-white px-3 py-1 rounded">Удалить</button>
            <div className="w-full h-full flex items-center justify-center">
              <img src={previewUrls[viewerIndex]} alt={`view-${viewerIndex}`} className="max-h-[85vh] max-w-full object-contain rounded" />
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 md:mt-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded text-sm flex-1 md:flex-none">Отправить</button>
        <button 
          type="button" 
          onClick={() => setShowConfig(!showConfig)} 
          className="px-3 py-2 bg-gray-700 text-white rounded text-sm flex-1 md:flex-none"
          title="Конфигурация"
        >
          ⚙️ Настройки
        </button>
        {status && (
          <div className="text-xs md:text-sm whitespace-pre-line flex-1">
            {status.split('\n').map((line, idx) => {
              let className = "text-gray-400";
              if (line.includes("✓")) {
                className = "text-green-400 font-semibold";
              } else if (line.includes("✗")) {
                className = "text-red-400 font-semibold";
              } else if (line.includes("⚠")) {
                className = "text-yellow-400 font-semibold";
              } else if (line.includes("Отправлено:") || line.includes("Отправка")) {
                className = "text-blue-400 font-semibold";
              }
              return (
                <div key={idx} className={className}>
                  {line}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-[var(--card-bg)] rounded-lg p-4 md:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">⚙️ Конфигурация</h3>
            
            <label className="flex flex-col mb-3 md:mb-4">
              <span className="text-xs md:text-sm font-semibold mb-1">Telegram Bot Token</span>
              <input 
                type="text" 
                value={telegramToken} 
                onChange={(e) => setTelegramToken(e.target.value)} 
                placeholder="1234567890:ABC..."
                className="p-2 rounded bg-transparent border text-xs md:text-sm"
              />
              <span className="text-xs text-gray-400 mt-1">Пример: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11</span>
            </label>

            <label className="flex flex-col mb-3 md:mb-4">
              <span className="text-xs md:text-sm font-semibold mb-1">Telegram Chat ID</span>
              <input 
                type="text" 
                value={telegramChatId} 
                onChange={(e) => setTelegramChatId(e.target.value)} 
                placeholder="-4930470025"
                className="p-2 rounded bg-transparent border text-xs md:text-sm"
              />
              <span className="text-xs text-gray-400 mt-1">Отрицательное число для группы</span>
            </label>

            <label className="flex flex-col mb-3 md:mb-4">
              <span className="text-xs md:text-sm font-semibold mb-1">Google Apps Script URL</span>
              <input 
                type="text" 
                value={googleScriptUrl} 
                onChange={(e) => setGoogleScriptUrl(e.target.value)} 
                placeholder="https://script.google.com/..."
                className="p-2 rounded bg-transparent border text-xs md:text-sm"
              />
              <span className="text-xs text-gray-400 mt-1">Опционально для Google Sheets</span>
            </label>

            <div className="flex gap-2">
              <button 
                onClick={saveConfig}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-xs md:text-sm"
              >
                ✓ Сохранить
              </button>
              <button 
                onClick={() => setShowConfig(false)}
                className="flex-1 px-3 py-2 bg-gray-600 text-white rounded text-xs md:text-sm"
              >
                ✗ Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
