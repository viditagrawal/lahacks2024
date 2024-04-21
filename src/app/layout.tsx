import type { Metadata, Viewport } from "next";
import ContextProvider from "./providers";

import { GeistSans } from "geist/font/sans";
import "./globals.css";
import React, { useState } from 'react';

export const metadata: Metadata = {
  title: "diagNose",
  description: "Get your symptoms diagnosed with the help of a community",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-abel">
        <ContextProvider>{children}</ContextProvider>
        </body>
    </html>
  );
}
