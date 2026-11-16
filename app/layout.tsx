import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Santiago Post",
  description: "Economía, política y negocios de Chile",
  metadataBase: new URL("https://santiagopost.cl"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
