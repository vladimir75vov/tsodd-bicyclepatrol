@echo off
chcp 65001 >nul
title tsodd-bicyclepatrol - Development Server

echo.
echo ═══════════════════════════════════════════════════════════
echo            tsodd-bicyclepatrol Development Server
echo ═══════════════════════════════════════════════════════════
echo.

cd /d "%~dp0frontend"

echo [1/3] Проверка Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не установлен!
    echo    Скачайте с https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION%

echo.
echo [2/3] Проверка зависимостей...
if not exist "node_modules\" (
    echo ⚠️  node_modules не найден. Установка зависимостей...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Ошибка установки зависимостей
        pause
        exit /b 1
    )
) else (
    echo ✅ Зависимости установлены
)

echo.
echo [3/3] Запуск сервера разработки...
echo.
echo 🚀 Сервер будет доступен по адресу:
echo    http://localhost:3000
echo.
echo 💡 Для остановки нажмите Ctrl+C
echo.

call npm run dev

pause
