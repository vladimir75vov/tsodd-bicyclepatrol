import "../resources/styles/globals.scss";

import { Inter } from "next/font/google";
import Navbar from "../components/layout/navbar.jsx";
import Footer from "../components/layout/footer.jsx";
import { LanguageProvider } from "../context/LanguageContext.jsx";
import { ThemeProvider } from "../context/ThemeContext.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import ThemeColor from "../components/ThemeColor.jsx";

const inter = Inter({ subsets: ["latin"] });

// Метаданные для SEO
export const metadata = {
  title: "Vladimir Budaev - Full Stack Developer",
  description: "Full Stack Developer | React | Next.js | Node.js | Digital Creator",
  keywords:
    "developer, tsodd-bicyclepatrol, react, nextjs, fullstack, javascript, typescript, frontend, backend, web development, moscow developer",
  authors: [{ name: "Vladimir Budaev" }],
  creator: "Vladimir Budaev",
  publisher: "Vladimir Budaev",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Vladimir Budaev - Full Stack Developer",
    description: "Full Stack Developer | React | Next.js | Node.js | Digital Creator",
    type: "website",
    locale: "en_US",
    alternateLocale: ["ru_RU"],
    siteName: "Vladimir Budaev tsodd-bicyclepatrol",
    url: "https://vladimir75vov.github.io/tsodd-bicyclepatrol",
    images: [
      {
        url: "/tsodd-bicyclepatrol/images/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Vladimir Budaev - Full Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vladimir Budaev - Full Stack Developer",
    description: "Full Stack Developer | React | Next.js | Node.js | Digital Creator",
    creator: "@vladimir75vov",
    images: ["/tsodd-bicyclepatrol/images/og-image.svg"],
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  category: "technology",
  applicationName: "Vladimir Budaev tsodd-bicyclepatrol",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://vladimir75vov.github.io/tsodd-bicyclepatrol"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "ru-RU": "/ru",
    },
  },
  icons: {
    icon: [{ url: "/tsodd-bicyclepatrol/favicon.ico" }, { url: "/tsodd-bicyclepatrol/icon.png", type: "image/png", sizes: "32x32" }],
    apple: [{ url: "/tsodd-bicyclepatrol/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/tsodd-bicyclepatrol/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vladimir Budaev",
  },
  other: {
    "google-site-verification": "your-google-verification-code",
    "yandex-verification": "your-yandex-verification-code",
    "mobile-web-app-capable": "yes",
  },
};

// Главный layout с providers для темы, языка и навигации
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#13151a" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${inter.className} bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-x-hidden`}>
        <LoadingScreen />
        <ThemeProvider>
          <ThemeColor />
          <LanguageProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
