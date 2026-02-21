import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Qmindai - Intelligent Resume Job Matching",
  description:
    "AI-powered resume and job description matching system with advanced skill analysis and compatibility scoring. Streamline your recruitment process with automated CV parsing, intelligent candidate matching, and AI-generated assessments.",
  keywords:
    "resume matching, job matching, CV analysis, skill extraction, HR tools, recruitment, applicant tracking system, ATS, AI recruitment, candidate screening, resume parser, job board, talent acquisition, hiring automation, skill assessment, AI interview",
  authors: [{ name: "Qmindai Team" }],
  creator: "Qmindai",
  publisher: "Qmindai",
  category: "Human Resources Technology",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://qmindai.site",
    siteName: "Qmindai",
    title: "Qmindai - AI-Powered Recruitment Platform",
    description:
      "Transform your hiring process with Qmindai's intelligent resume matching, automated skill analysis, and AI-driven candidate assessments. Perfect for HR teams and job seekers.",
    images: [
      {
        url: "/blue.png",
        width: 1200,
        height: 630,
        alt: "Qmindai - Intelligent Recruitment Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qmindai - AI-Powered Recruitment Platform",
    description:
      "Transform your hiring process with intelligent resume matching, automated skill analysis, and AI-driven assessments.",
    images: ["/blue.png"],
    creator: "@qmindai",
  },
  alternates: {
    canonical: "https://qmindai.site",
  },
  metadataBase: new URL("https://qmindai.site"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <AuthProvider>
          <main>{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
