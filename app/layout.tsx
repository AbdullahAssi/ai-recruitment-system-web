import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Navigation, Footer } from "@/components/common";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CV-JD Matcher - Intelligent Resume Job Matching",
  description:
    "AI-powered resume and job description matching system with advanced skill analysis and compatibility scoring.",
  keywords:
    "resume matching, job matching, CV analysis, skill extraction, HR tools, recruitment",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Navigation />
        <main>{children}</main>
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}
