"use client";

import { useContext, useState } from "react";
import Image from "next/image";
import { LanguageContext } from "../../context/LanguageContext";
import { ThemeContext } from "../../context/ThemeContext";
import { SiDiscord, SiGithub, SiTelegram, SiVk, SiWhatsapp } from "react-icons/si";
import { useDeviceTilt } from "../../components/useDeviceTilt.jsx";

// Страница контактов с формой отправки в Telegram и соц. сетями
export default function ContactPage() {
  const { lang } = useContext(LanguageContext);
  const { christmasMode, autumnMode } = useContext(ThemeContext);
  const tilt = useDeviceTilt();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Получение токена и chat_id из переменных окружения
    const telegramBotToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    // Проверка наличия переменных окружения
    if (!telegramBotToken || !telegramChatId) {
      console.error('Telegram credentials not configured');
      console.log('Bot Token:', telegramBotToken ? 'Set' : 'Missing');
      console.log('Chat ID:', telegramChatId ? 'Set' : 'Missing');
      alert(
        lang === "en"
          ? "Contact form is not configured. Please contact via social media."
          : "Форма контакта не настроена. Пожалуйста, свяжитесь через социальные сети."
      );
      return;
    }

    const message = `
📧 Новое сообщение с портфолио!

👤 Имя: ${formData.name}
📨 Email: ${formData.email}

💬 Сообщение:
${formData.message}
    `.trim();

    try {
      const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: message,
          parse_mode: "HTML",
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        const errorData = await response.json();
        console.error('Telegram API error:', errorData);
        alert(
          lang === "en"
            ? "Failed to send message. Please try again."
            : "Не удалось отправить сообщение. Попробуйте снова."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        lang === "en"
          ? "Failed to send message. Please try again."
          : "Не удалось отправить сообщение. Попробуйте снова."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20 relative">
            {/* Сезонные декорации */}
            {christmasMode && (
              <>
                <Image src="/tsodd-bicyclepatrol/images/Christmas tree.png" alt="Christmas tree" width={100} height={100} className="absolute -top-10 left-[10%] opacity-25 pointer-events-none select-none brightness-150 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-transform duration-700 ease-out" style={{ transform: `translate(${tilt.x * 0.6}px, ${tilt.y * 0.6}px)` }} unoptimized />
                <Image src="/tsodd-bicyclepatrol/images/Christmas tree.png" alt="Christmas tree" width={80} height={80} className="absolute -top-5 right-[15%] opacity-20 pointer-events-none select-none brightness-150 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-transform duration-700 ease-out" style={{ transform: `translate(${tilt.x * 0.4}px, ${tilt.y * 0.4}px)` }} unoptimized />
              </>
            )}
            {autumnMode && (
              <>
                <span className="absolute -top-10 left-[10%] text-7xl opacity-25 pointer-events-none select-none transition-transform duration-700 ease-out" style={{ transform: `translate(${tilt.x * 0.6}px, ${tilt.y * 0.6}px)` }}>🍂</span>
                <span className="absolute -top-5 right-[15%] text-6xl opacity-20 pointer-events-none select-none transition-transform duration-700 ease-out" style={{ transform: `translate(${tilt.x * 0.4}px, ${tilt.y * 0.4}px)` }}>🍁</span>
              </>
            )}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">
              {lang === "en" ? "Get In Touch" : "Свяжитесь со мной"}
            </h1>
            <p className="text-lg text-[var(--text-secondary)]">
              {lang === "en" ? "Have a project? Let's talk about it." : "Есть проект? Давайте об этом поговорим."}
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--card-border)] rounded-lg p-8">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                {lang === "en" ? "Send me a message" : "Отправьте сообщение"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    {lang === "en" ? "Name" : "Имя"}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50"
                    placeholder={lang === "en" ? "Your name" : "Ваше имя"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    {lang === "en" ? "Email" : "Email"}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50"
                    placeholder={lang === "en" ? "your@email.com" : "ваш@email.com"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    {lang === "en" ? "Message" : "Сообщение"}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 resize-none"
                    placeholder={lang === "en" ? "Your message..." : "Ваше сообщение..."}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-green-600 text-white font-semibold rounded-lg hover:scale-[1.02] transition-all duration-200 mt-2"
                >
                  {lang === "en" ? "Send" : "Отправить"}
                </button>

                {submitted && (
                  <div className="text-center text-green-400 font-medium">
                    {lang === "en" ? "Message sent!" : "Сообщение отправлено!"}
                  </div>
                )}
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              {/* Direct Contacts */}
              <div className="bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--card-border)] rounded-lg p-8">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                  {lang === "en" ? "Contact Info" : "Контактная информация"}
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[var(--text-muted)] mb-1">{lang === "en" ? "Email" : "Email"}</p>
                    <a href="mailto:vladimir75vov@gmail.com" className="text-blue-400 hover:text-blue-300 font-medium">
                      vladimir75vov@gmail.com
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)] mb-1">{lang === "en" ? "Phone" : "Телефон"}</p>
                    <a href="tel:+79037095173" className="text-blue-400 hover:text-blue-300 font-medium">
                      +7 (903) 709-5173
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-muted)] mb-1">
                      {lang === "en" ? "Location" : "Местоположение"}
                    </p>
                    <p className="text-[var(--text-secondary)] font-medium">
                      {lang === "en" ? "Moscow, Russia" : "Москва, Россия"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--card-border)] rounded-lg p-8">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                  {lang === "en" ? "Follow Me" : "Следите за мной"}
                </h2>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://t.me/vladimir75vov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg hover:scale-105 hover:border-blue-500/50 transition-all"
                    aria-label="Telegram"
                  >
                    <SiTelegram size={24} className="text-blue-400" />
                  </a>
                  <a
                    href="https://vk.com/vladimir75vov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg hover:scale-105 hover:border-blue-500/50 transition-all"
                    aria-label="VK"
                  >
                    <SiVk size={24} className="text-blue-400" />
                  </a>
                  <a
                    href="https://wa.me/89037095173"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg hover:scale-105 hover:border-blue-500/50 transition-all"
                    aria-label="WhatsApp"
                  >
                    <SiWhatsapp size={24} className="text-blue-400" />
                  </a>
                  <a
                    href="https://discordapp.com/users/289114042763575296"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg hover:scale-105 hover:border-blue-500/50 transition-all"
                    aria-label="Discord"
                  >
                    <SiDiscord size={24} className="text-blue-400" />
                  </a>
                  <a
                    href="https://github.com/vladimir75vov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg hover:scale-105 hover:border-blue-500/50 transition-all"
                    aria-label="GitHub"
                  >
                    <SiGithub size={24} className="text-blue-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

