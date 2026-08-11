import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Universe Monitor",
  description:
    "Cosmic ops dashboard — NEOs, planetary alignment, ISS, zoom from deep space to Earth",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
