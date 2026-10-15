import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import DotField from "./components/dot-field";
import Splash, { SPLASH_CHECK } from "./components/splash";
import "./globals.css";

// Same type pairing as frontiercommons.org.
const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Frontier Max",
  description: "Watch movies and TV series.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The splash check may add a class to <html> before React loads.
    <html lang="en" className={`${manrope.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SPLASH_CHECK }} />
      </head>
      <body>
        <Splash />
        <DotField />
        {children}
      </body>
    </html>
  );
}
