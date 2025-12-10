import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Pilates Diário",
    template: "%s | Pilates Diário",
  },
  description: "Seu aplicativo de pilates diário em poucos minutos.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: "/icons/pilates-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/pilates-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/apple-touch-icon.png",
  },
  themeColor: "#0C0C0C",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pilates Diário",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
