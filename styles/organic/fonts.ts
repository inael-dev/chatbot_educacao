import { Inter } from "next/font/google";

export const organicHeading = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-organic-heading",
  weight: ["600", "700"],
});

export const organicBody = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-organic-body",
  weight: ["400", "500", "600"],
});
