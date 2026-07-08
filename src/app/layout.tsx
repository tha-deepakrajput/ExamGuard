import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ExamGuard – AI-Powered Online Examination Platform",
    template: "%s | ExamGuard",
  },
  description:
    "Enterprise-grade online examination platform with AI-powered proctoring, real-time monitoring, and comprehensive analytics. Trusted by educational institutions and corporations worldwide.",
  keywords: [
    "online examination",
    "AI proctoring",
    "exam platform",
    "assessment",
    "education technology",
  ],
  authors: [{ name: "ExamGuard" }],
  openGraph: {
    type: "website",
    title: "ExamGuard – AI-Powered Online Examination Platform",
    description:
      "Enterprise-grade online examination platform with AI-powered proctoring.",
    siteName: "ExamGuard",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <SessionProvider>
            <QueryProvider>
              <TooltipProvider delay={300}>
                {children}
                <Toaster richColors position="top-right" />
              </TooltipProvider>
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
