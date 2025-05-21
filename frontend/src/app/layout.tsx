// src/app/layout.tsx
import './globals.css';
import { Prompt } from 'next/font/google';

const prompt = Prompt({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['thai', 'latin'],
  display: 'swap',
  variable: '--font-prompt',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Remove any whitespace or newline characters between <html> and <body>
    <html lang="th" className={`${prompt.variable}`}>
      <body>{children}</body>
    </html>
  );
}
