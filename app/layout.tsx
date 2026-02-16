import type { Metadata } from "next";

import "./globals.css";
import { Nunito } from 'next/font/google';


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
    <html lang="en" className={`${nunito.variable} font-sans`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}