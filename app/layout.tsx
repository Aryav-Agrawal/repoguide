import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionProvider } from "@/components/MotionProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "RepoGuide: guided tours of any GitHub repo";
const description =
  "Paste a public GitHub repo and get a guided tour: a summary, a map of the main modules, and where to start reading.";

// The favicon (app/icon.svg), Apple icon (app/apple-icon.tsx) and share image
// (app/opengraph-image.tsx) are picked up from their file names automatically.
// On Vercel, Next.js also works out the site's full URL for the share image by itself.
export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: "RepoGuide",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
