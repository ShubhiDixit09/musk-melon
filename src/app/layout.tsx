import type { Metadata } from "next";
import { Inter, Special_Elite, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const specialElite = Special_Elite({ weight: "400", subsets: ["latin"], variable: "--font-special-elite" });
const shareTechMono = Share_Tech_Mono({ weight: "400", subsets: ["latin"], variable: "--font-share-tech" });

export const metadata: Metadata = {
  title: "Muskmelon — Elon Musk Knowledge Twin",
  description: "Version-Controlled Knowledge Twin of Elon Musk — An immersive AI experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${specialElite.variable} ${shareTechMono.variable} ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}
