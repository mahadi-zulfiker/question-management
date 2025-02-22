import { Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const notoBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali", "latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "প্রশ্ন ব্যবস্থাপনা অ্যাপ",
  description: "বাংলা ভাষায় প্রশ্ন ব্যবস্থাপনা ও সংগঠনের জন্য অ্যাপ",
};

export default function RootLayout({ children }) {
  return (
    <Providers>
      <html lang="bn">
        <body className={`${notoBengali.variable} antialiased`}>
          {children}
        </body>
      </html>
    </Providers>
  );
}
