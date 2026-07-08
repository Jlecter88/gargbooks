import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import { BookProvider } from "@/context/BookContext";
import { UserProvider } from "@/context/UserContext";
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

export const metadata: Metadata = {
  title: "Gargbooks - Sebo e Leitura Premium",
  description: "Marketplace literário e clube de leitura digital com design premium por Creative Pash",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${playfair.variable} ${outfit.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-stone-100 font-sans">
        <UserProvider>
          <BookProvider>
            {children}
          </BookProvider>
        </UserProvider>
      </body>
    </html>
  );
}
