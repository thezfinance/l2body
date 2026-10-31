import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import { BookOpen, Coins, Hammer, Video } from "lucide-react";
import Link from "next/link";
import "./globals.css";

const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "L2body", template: "%s | L2body" },
  description:
    "Guides, videos, crafts and market prices for Lineage 2 Interlude on L2 Reborn x10 Eternal.",
};

const nav = [
  { href: "/guides", label: "Guides", Icon: BookOpen },
  { href: "/videos", label: "Videos", Icon: Video },
  { href: "/crafts", label: "Crafts", Icon: Hammer },
  { href: "/market", label: "Market", Icon: Coins },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-panel-edge bg-ink/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="font-heading text-2xl tracking-widest text-gold-bright">
              L2body
            </Link>
            <nav className="flex gap-4 text-sm sm:gap-6">
              {nav.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 text-parchment hover:text-gold-bright"
                >
                  <Icon className="h-4 w-4 text-gold" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
        <footer className="border-t border-panel-edge px-4 py-6 text-center text-xs text-muted">
          L2body is an unofficial information site about Lineage 2. All exclusive rights to the
          game and its elements belong to NCSoft. L2body is not affiliated with NCSoft or L2 Reborn.
        </footer>
      </body>
    </html>
  );
}
