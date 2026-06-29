import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareNotes AI — Aged Care Documentation Assistant",
  description: "Turn quick care observations into structured, compliant progress notes in seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-800 antialiased">{children}</body>
    </html>
  );
}
