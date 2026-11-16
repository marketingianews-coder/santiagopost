import type { Metadata } from "next";
import { Gloock, Archivo } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Tipografías de marca: Gloock (titulares) y Archivo (cuerpo).
const gloock = Gloock({ subsets: ["latin"], weight: "400", variable: "--font-gloock", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Santiago Post", template: "%s · Santiago Post" },
  description: "Economía, política y negocios de Chile",
  metadataBase: new URL("https://santiagopost.cl"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${gloock.variable} ${archivo.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
