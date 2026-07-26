import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Tutor Marketplace Admin",
  description: "Operations console for the tutor marketplace."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

