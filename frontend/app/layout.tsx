import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "../components/Sidebar";
import React from "react";
import { DataProvider } from "./context/DataContext";

import { ChatWidget } from "../components/ChatWidget";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Personal Workflow",
  description: "Automated decision layer for your work",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0b1021] text-slate-300 min-h-screen flex`}>
        <DataProvider>
          <Sidebar />
          <div className="flex-1 ml-64 relative min-h-screen">
            {children}
          </div>
          <ChatWidget />
        </DataProvider>
      </body>
    </html>
  );
}
