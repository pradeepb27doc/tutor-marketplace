import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { ErrorBoundary } from "@/components/common/error-boundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tutor Marketplace — Find Verified Tutors",
  description:
    "Connect with verified tutors for school, competitive exams, coding, music, languages, and more—all in one trusted platform."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
