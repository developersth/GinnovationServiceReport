// src/app/layout.tsx
import './globals.css';
import { Sarabun } from 'next/font/google'; // เปลี่ยนจาก Prompt เป็น Sarabun

// กำหนดค่าฟอนต์ Sarabun
const sarabun = Sarabun({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'], // กำหนดน้ำหนักที่ต้องการ
  subsets: ['thai', 'latin'], // ระบุ subsets ที่จำเป็น
  display: 'swap',
  variable: '--font-sarabun', // กำหนด CSS variable name
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ใช้ className ของฟอนต์ Sarabun
    <html lang="th" className={`${sarabun.variable}`}>
      <body>{children}</body>
    </html>
  );
}
