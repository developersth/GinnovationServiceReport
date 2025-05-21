// src/app/layout.tsx
import './globals.css';
// Import the new font: Prompt
import { Prompt } from 'next/font/google';
// If you have Noto_Serif_Thai or Inter already, keep them if needed elsewhere
// import { Noto_Serif_Thai } from 'next/font/google';
// import { Inter } from 'next/font/google';

// Define the Prompt font
const prompt = Prompt({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], // Select weights you need
  subsets: ['thai', 'latin'], // Essential for Thai characters
  display: 'swap', // Ensures smooth font loading
  variable: '--font-prompt', // Define a CSS variable for Tailwind/global CSS
});

// If you had other fonts, define them here
// const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
// const notoSansThai = Noto_Serif_Thai({
//   weight: ['400', '700'], subsets: ['thai', 'latin'], display: 'swap', variable: '--font-noto-serif-thai'
// });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Add the new font's className to the <html> tag
    // You can combine multiple font variables if you need them for different purposes
    <html lang="th" className={`${prompt.variable}`}> {/* Add other font variables if necessary */}
      <body>{children}</body>
    </html>
  );
}