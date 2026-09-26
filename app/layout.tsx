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
  metadataBase: new URL("https://rosa-politica.vercel.app"),
  title: "Rosa Política",
  description:
    "Teste político por dilemas: escolha o que faria e veja seu perfil.",
  openGraph: {
    title: "Rosa Política",
    description:
      "Teste político por dilemas: escolha o que faria e veja seu perfil.",
    siteName: "Rosa Política",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rosa Política",
    description:
      "Teste político por dilemas: escolha o que faria e veja seu perfil.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-dvh flex-col font-[family-name:var(--font-sans)] antialiased">
        <header className="border-b border-[var(--line)] px-6 py-4">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4">
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--accent)]"
            >
              Rosa Política
            </Link>
            <nav className="flex items-center gap-4 text-sm text-[var(--muted)]">
              <Link
                href="/posicoes"
                className="transition-colors hover:text-[var(--ink)]"
              >
                Posições
              </Link>
              <Link
                href="/play"
                className="transition-colors hover:text-[var(--ink)]"
              >
                Teste
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex flex-1 flex-col px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
