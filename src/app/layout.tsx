import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PartySally - Multiplayer Party Games",
  description: "TV displays game, smartphones are controllers. Play Comic Hazard, Mercante in Fiera, UNO with friends!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="antialiased">{children}</body>
    </html>
  );
}
