import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/contexts/ToastContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgentFlow - AI 协作网络",
  description: "任务驱动的 AI 协作网络",
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ToastProvider>
          <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col">
            <Navigation />
            <main className="pt-20 flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
