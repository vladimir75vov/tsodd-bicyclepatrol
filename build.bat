@echo off
chcp 65001 >nul
title tsodd-bicyclepatrol - Production Build

echo.
echo ═══════════════════════════════════════════════════════════
echo            tsodd-bicyclepatrol Production Build
echo ═══════════════════════════════════════════════════════════
echo.

cd /d "%~dp0frontend"

echo [1/4] Проверка Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не установлен!
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION%

echo.
echo [2/4] Установка зависимостей...
call npm ci --silent
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей
    pause
    exit /b 1
)
echo ✅ Зависимости установлены

echo.
echo [3/4] Проверка кода (ESLint)...
call npm run lint
if %errorlevel% neq 0 (
    echo ⚠️  Есть предупреждения ESLint
)

echo.
echo [4/4] Сборка проекта...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Ошибка сборки
    pause
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════════════════
echo ✅ Сборка успешно завершена!
echo ═══════════════════════════════════════════════════════════
echo.
echo 📁 Результат: frontend\out\
echo.
echo 📊 Статистика:
dir /s /b out\*.html 2>nul | find /c /v "" > temp.txt
set /p HTML_COUNT=<temp.txt
del temp.txt
echo    - HTML страниц: %HTML_COUNT%
echo    - Размер: 
powershell -Command "'{0:N2} MB' -f ((Get-ChildItem -Path 'out' -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB)"
echo.

pause
