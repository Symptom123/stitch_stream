import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { WatchlistProvider } from "@/context/WatchlistContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#090a0f",
};

export const metadata: Metadata = {
  title: "Stitch Stream — Watch Movies & TV Series in Ultra HD",
  description:
    "Stitch Stream is a sleek streaming platform to discover trending movies, series, watch official trailers, and curate your personalized watchlist.",
  keywords: ["movies", "streaming", "tv shows", "watch online", "stitch stream", "trailers"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Stitch Stream",
  },
  icons: {
    icon: "/06_favicon.svg",
    apple: "/05_app_icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <head>
        <link rel="icon" href="/06_favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/05_app_icon.svg" />
        <link rel="preconnect" href="https://vidlink.pro" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://vidsrc.me" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://vidsrc.to" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vidsrc.pm" />
        <link rel="dns-prefetch" href="https://multiembed.mov" />
        <link rel="dns-prefetch" href="https://embed.smashystream.com" />
        <link rel="dns-prefetch" href="https://www.2embed.skin" />
      </head>
      <body className="min-h-full flex flex-col bg-[#090a0f] text-white">
        <UserProvider>
          <WatchlistProvider>{children}</WatchlistProvider>
        </UserProvider>
      </body>
    </html>
  );
}
