/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'export',  // Статический экспорт для GitHub Pages
    basePath: '/tsodd-bicyclepatrol',  // Для репозитория vladimir75vov.github.io/portfolio
    assetPrefix: '/tsodd-bicyclepatrol',  // Для репозитория vladimir75vov.github.io/portfolio
    images: {
        unoptimized: true,  // Отключение оптимизации изображений для статического экспорта
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    trailingSlash: true,  // Добавляет слэш в конце URL для совместимости с GitHub Pages
    env: {
        NEXT_PUBLIC_BASE_PATH: '/tsodd-bicyclepatrol',  // Переменная окружения для basePath
        NEXT_PUBLIC_TELEGRAM_BOT_TOKEN: process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN,
        NEXT_PUBLIC_TELEGRAM_CHAT_ID: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID,
    },
    // rewrites и redirects не поддерживаются в статическом экспорте
};

export default nextConfig;
