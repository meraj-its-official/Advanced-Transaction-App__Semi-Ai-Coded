import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paytm Wallet | Fast & Secure P2P Payments",
  description: "Full-stack digital wallet and P2P transaction platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}