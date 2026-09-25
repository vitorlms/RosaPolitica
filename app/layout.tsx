import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Rosa Política",
  description:
    "Protótipo de análise política por ficção interativa na Confederação de Valmora.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-sans)] antialiased">
        <header className="border-b border-[var(--line)] px-6 py-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--accent)]"
          >
            Rosa Política
          </Link>
        </header>
        <main className="flex flex-1 flex-col px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
