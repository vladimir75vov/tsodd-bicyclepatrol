"use client";

import React, { useContext } from "react";
import Link from "next/link";
import { SiDiscord, SiGithub, SiTelegram, SiVk, SiWhatsapp } from "react-icons/si";
import LinkOpenNewTabComp from "../linkOpenNewTabComp.jsx";
import { LanguageContext } from "../../context/LanguageContext.jsx";
import { ThemeContext } from "../../context/ThemeContext.jsx";
import { useDeviceTilt } from "../useDeviceTilt.jsx";

// Компонент футера с быстрыми ссылками и социальными сетями
function Footer() {
  const { t } = useContext(LanguageContext);
  const { christmasMode, autumnMode } = useContext(ThemeContext);
  const tilt = useDeviceTilt();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] py-12 mt-20 relative overflow-hidden">
      {/* Сезонные декорации */}
      {christmasMode && (
        <>
          <span className="absolute top-4 left-[5%] text-5xl opacity-20 pointer-events-none select-none transition-transform duration-700 ease-out" style={{ transform: `translate(${tilt.x * 0.4}px, ${tilt.y * 0.4}px)` }}>🎁</span>
          <span className="absolute top-8 right-[8%] text-6xl opacity-15 pointer-events-none select-none transition-transform duration-700 ease-out" style={{ transform: `translate(${tilt.x * 0.5}px, ${tilt.y * 0.5}px)` }}>🎁</span>
          <span className="absolute bottom-10 left-[15%] text-4xl opacity-10 pointer-events-none select-none transition-transform duration-700 ease-out" style={{ transform: `translate(${tilt.x * 0.3}px, ${tilt.y * 0.3}px)` }}>🎁</span>
          <span className="absolute bottom-4 right-[20%] text-5xl opacity-20 pointer-events-none select-none transition-transform duration-700 ease-out" style={{ transform: `translate(${tilt.x * 0.4}px, ${tilt.y * 0.4}px)` }}>🎁</span>
        </>
      )}
      {autumnMode && (
        <>
          <span className="absolute top-4 left-[5%] text-5xl opacity-20 pointer-events-none select-none transition-transform duration-700 ease-out" style={{ transform: `translate(${tilt.x * 0.4}px, ${tilt.y * 0.4}px)` }}>🍂</span>
          <span className="absolute top-8 right-[8%] text-6xl opacity-15 pointer-events-none select-none transition-transform duration-700 ease-out" style={{ transform: `translate(${tilt.x * 0.5}px, ${tilt.y * 0.5}px)` }}>🍁</span>
          <span className="absolute bottom-10 left-[15%] text-4xl opacity-10 pointer-events-none select-none transition-transform duration-700 ease-out" style={{ transform: `translate(${tilt.x * 0.3}px, ${tilt.y * 0.3}px)` }}>🍂</span>
          <span className="absolute bottom-4 right-[20%] text-5xl opacity-20 pointer-events-none select-none transition-transform duration-700 ease-out" style={{ transform: `translate(${tilt.x * 0.4}px, ${tilt.y * 0.4}px)` }}>🍁</span>
        </>
      )}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-green-500 rounded-lg flex items-center justify-center font-bold text-white mb-4">
              VB
            </div>
            <p className="text-[var(--text-muted)] text-sm">{t("footer.developer")}</p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center">
            <h3 className="text-[var(--text-primary)] font-semibold mb-4">{t("footer.quickLinks")}</h3>
            <div className="flex flex-col gap-3 text-[var(--text-muted)] text-sm items-center">
              <Link href="/report" className="hover:text-blue-400 transition-colors">
                Отчёт
              </Link>
              <Link href="/contact" className="hover:text-blue-400 transition-colors">
                {t("footer.contact")}
              </Link>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-center md:items-end">
            <h3 className="text-[var(--text-primary)] font-semibold mb-4">{t("footer.follow")}</h3>
            <ul className="flex justify-center md:justify-end gap-3">
              <li>
                <LinkOpenNewTabComp url="https://t.me/vladimir75vov">
                  <SiTelegram />
                </LinkOpenNewTabComp>
              </li>
              <li>
                <LinkOpenNewTabComp url="https://vk.com/vladimir75vov">
                  <SiVk />
                </LinkOpenNewTabComp>
              </li>
              <li>
                <LinkOpenNewTabComp url="https://wa.me/89037095173">
                  <SiWhatsapp />
                </LinkOpenNewTabComp>
              </li>
              <li>
                <LinkOpenNewTabComp url="https://discordapp.com/users/289114042763575296">
                  <SiDiscord />
                </LinkOpenNewTabComp>
              </li>
              <li>
                <LinkOpenNewTabComp url="https://github.com/vladimir75vov">
                  <SiGithub />
                </LinkOpenNewTabComp>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border-color)] pt-8">
          <p className="text-center text-[var(--text-muted)] text-sm">
            &copy; {currentYear} Vladimir Budaev. {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

