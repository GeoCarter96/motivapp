import type { Metadata } from "next";

import "./globals.css";
import { Nunito } from 'next/font/google';
import SidebarWrapper from "@/components/sidebarwrapper";

const nunito = Nunito({ 
  subsets: ['latin'],
  weight: ['900'], 
  variable: '--font-nunito',
});
export const metadata: Metadata = {
  title: "Motiv App",
  description: "Created By Geoff Carter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) { 

  return (
    <html lang="en" className={`${nunito.variable} font-sans`}suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const saved = localStorage.getItem('theme');
              const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
              if (isDark) document.documentElement.classList.add('dark');
            })()
          `
        }} /></head>
      <body className="antialiased">
        {children}
       <SidebarWrapper />
      </body>
    </html>
  )
}