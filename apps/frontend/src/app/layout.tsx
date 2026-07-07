import type { Metadata } from "next";
import { Inter, Crimson_Pro } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["300", "400", "600"],
});

export const metadata: Metadata = {
  title: "ScriptoraAI — AI-Powered Narrative Workspace",
  description:
    "Plan, write, and collaborate on long-form stories, screenplays, and series with AI-powered narrative memory and real-time co-authoring.",
  keywords: ["screenplay", "novel writing", "AI writing", "story planning", "collaboration"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${crimsonPro.variable} h-full`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
