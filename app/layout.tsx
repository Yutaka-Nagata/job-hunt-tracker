import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "./context";
import Nav from "./components/Nav";

export const metadata: Metadata = {
  title: "就活トラッカー",
  description: "就活の進捗を管理するアプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        <AppProvider>
          <Nav />
          <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
