import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Changed from Geist_Sans
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ // Changed from geistSans and Geist_Sans
  variable: '--font-inter', // Changed font variable name
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SwaraML - Indian Classical Music Analysis',
  description: 'Live pitch analysis and recording for Indian classical music.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased flex flex-col min-h-screen`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
