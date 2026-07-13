import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://runclubs.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "RunClubs.in — Every run club in India. One map.",
    template: "%s · RunClubs.in",
  },
  description:
    "Find your run club: where they meet, what pace they run, how many show up, and exactly how to join. Free, no login, verified with clubs.",
  openGraph: {
    type: "website",
    siteName: "RunClubs.in",
    title: "RunClubs.in — Every run club in India. One map.",
    description:
      "Where they meet, what pace they run, how many show up, and exactly how to join.",
    url: SITE,
  },
  twitter: {
    card: "summary_large_image",
    title: "RunClubs.in — Every run club in India. One map.",
    description: "Find your people. Then keep up.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
