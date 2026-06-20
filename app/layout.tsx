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
  metadataBase: new URL("https://finetech-nine.vercel.app/"),
  title: "Fintech Man",
  description: "A smart fintech application for modern finance management.",
  openGraph: {
    title: "Fintech ",
    description: "A smart fintech application for modern finance management.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Fintech Man Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fintech Man",
    description: "A smart fintech application for modern finance management.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-gray-50">{children}</body>
    </html>
  );
}
