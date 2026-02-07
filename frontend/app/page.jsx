"use client";

import Link from "next/link";

export default function RootPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            TSODD Bicycle Patrol
          </h1>
          <p className="text-gray-300 text-lg md:text-xl">
            Система мониторинга и отчетности велосипедного парка
          </p>
        </div>

        {/* Main CTA */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Report Card */}
          <Link href="/report" className="group">
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-lg p-8 hover:border-blue-300/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500/30 rounded-lg mb-4 group-hover:bg-blue-500/50 transition-colors">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Создать отчет</h2>
              <p className="text-gray-400 text-sm">
                Добавьте новый отчет о техническом состоянии велосипедов с фотографиями
              </p>
            </div>
          </Link>

          {/* Contact Card */}
          <Link href="/contact" className="group">
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-8 hover:border-purple-300/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-500/30 rounded-lg mb-4 group-hover:bg-purple-500/50 transition-colors">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Контакты</h2>
              <p className="text-gray-400 text-sm">
                Свяжитесь с нами для получения дополнительной информации
              </p>
            </div>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="text-blue-400 text-2xl mb-2">📸</div>
            <h3 className="text-white font-semibold mb-1">Фото отчеты</h3>
            <p className="text-gray-400 text-sm">Загружайте фотографии велосипедов с автоматической гео-меткой</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="text-purple-400 text-2xl mb-2">📊</div>
            <h3 className="text-white font-semibold mb-1">Аналитика</h3>
            <p className="text-gray-400 text-sm">Отслеживайте состояние и статистику парка велосипедов</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="text-pink-400 text-2xl mb-2">📍</div>
            <h3 className="text-white font-semibold mb-1">Геолокация</h3>
            <p className="text-gray-400 text-sm">Автоматическое определение местоположения инспекции</p>
          </div>
        </div>
      </div>
    </div>
  );
}
