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
  metadataBase: new URL("https://finetech-nine.vercel.app"),

  title: "Fintech",
  description:
    "Finance • Technology • Future. Smart fintech solutions powered by technology.",

  openGraph: {
    title: "Fintech",
    description:
      "Finance • Technology • Future. Smart fintech solutions powered by technology.",
    url: "https://finetech-nine.vercel.app",
    siteName: "Fintech",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 1200,
        alt: "Fintech Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Fintech",
    description:
      "Finance • Technology • Future. Smart fintech solutions powered by technology.",
    images: ["/logo.png"],
  },

  robots: {
    index: true,
    follow: true,
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
      <body className="min-h-full bg-gray-50">
        {children}
      </body>
    </html>
  );
}
