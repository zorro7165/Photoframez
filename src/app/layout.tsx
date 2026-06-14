import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import './globals.css';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "Ritwika's Personalized Photo Frames - Customize & Buy Online",
  description: "Transform your favorite Instagram images, digital photos, or wallpapers into premium framed prints. Real-time wall previews, multiple frame sizes, and solid wood textures.",
  openGraph: {
    title: "Ritwika's Personalized Photo Frames",
    description: "Transform your favorite photos into premium framed wall art.",
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 transition-colors duration-250">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
