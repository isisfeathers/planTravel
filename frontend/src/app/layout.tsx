import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import "./globals.css";
import { LiffProvider } from "@/components/auth/LiffProvider";

export const metadata: Metadata = {
  title: "Atrip 你的 AI 自由行規劃夥伴",
  description: "Atrip LIFF Web App",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">載入中...</div>}>
          <LiffProvider>{children}</LiffProvider>
        </Suspense>
      </body>
    </html>
  );
}

