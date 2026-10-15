import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import DotField from "./components/dot-field";
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
    <html lang="en" className={`${manrope.variable} ${plexMono.variable}`}>
      <body>
        <DotField />
        {children}
      </body>
    </html>
  );
}
