import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Atrip 雙層標籤精靈",
  description: "Atrip LIFF Web App Track 1 雙層標籤精靈",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body className="bg-atrip-surface-page font-atrip text-atrip-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
