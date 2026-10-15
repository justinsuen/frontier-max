import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Frontier Max",
  description: "Watch movies and TV series.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
