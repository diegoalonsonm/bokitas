import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bokitas - Tu App de Comida",
  description: "Descubre, ordena y disfruta de la mejor comida con Bokitas. La forma más fácil de pedir tus antojos favoritos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} antialiased bg-background text-text-main min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
