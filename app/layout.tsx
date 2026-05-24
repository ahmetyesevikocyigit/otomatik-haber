import React from "react";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Haber Akışı",
  description: "Gündem, siyaset, ekonomi, futbol, teknoloji ve kültür haberleri.",
};

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head />
      <body className="bg-white text-neutral-950">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

export default RootLayout;
