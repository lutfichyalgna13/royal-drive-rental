import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RENTAL MOBIL | Sewa Mobil Harian, Mingguan & Bulanan",
  description: "Penyedia layanan rental mobil prima lepas kunci dan dengan sopir profesional. Unit terawat, harga terbaik 24 jam.",
  keywords: ["rental mobil", "sewa mobil", "sewa innova reborn", "sewa avanza", "rental mobil murah", "rental cisoka", "sewa calya", "rental alphard"],
  openGraph: {
    title: "RENTAL MOBIL | Sewa Mobil Harian, Mingguan & Bulanan",
    description: "Sewa mobil harian, mingguan, bulanan dengan unit prima harga terbaik.",
    siteName: "Rental Mobil",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RENTAL MOBIL | Sewa Mobil Harian, Mingguan & Bulanan",
    description: "Sewa mobil harian, mingguan, bulanan dengan unit prima harga terbaik.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className="h-full antialiased bg-primary text-neutral-bg font-sans min-h-screen selection:bg-accent selection:text-primary"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
