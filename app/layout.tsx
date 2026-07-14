import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

// Fraunces — display/brand. Variable font: full weight range (incl. 350/400/600)
// plus optical sizing (opsz) and italic for the brand suffix.
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
});
// Inter — body/UI.
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
// IBM Plex Mono — micro-labels (static font: explicit weights).
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "600"],
  display: "swap",
});

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
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
