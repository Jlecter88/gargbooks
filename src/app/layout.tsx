import type { Metadata } from "next";
import { Playfair_Display, Outfit, Pinyon_Script } from "next/font/google";
import Script from "next/script";
import { BookProvider } from "@/context/BookContext";
import { UserProvider } from "@/context/UserContext";
import CustomCursor from "@/components/CustomCursor";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const pinyon = Pinyon_Script({
  weight: "400",
  variable: "--font-script",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gargbooks - Contos, Relatos & Histórias",
  description: "Portal mundial de contos e relatos com tradução automática. Leia, publique, comente e descubra histórias de todos os gêneros.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${playfair.variable} ${outfit.variable} ${pinyon.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-stone-100 font-sans">
        <UserProvider>
          <BookProvider>
            {children}
            <CustomCursor />
            <Script
              async
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2716163694456305"
              crossOrigin="anonymous"
              strategy="beforeInteractive"
            />
          </BookProvider>
        </UserProvider>
      </body>
    </html>
  );
}
