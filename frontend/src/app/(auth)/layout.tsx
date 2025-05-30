// src/app/(auth)/layout.tsx
'use client'; // เพิ่มบรรทัดนี้เพื่อให้คอมโพเนนต์ทำงานในฝั่ง Client

import { ReactNode, useEffect } from 'react'; // Import useEffect
import { useRouter } from 'next/navigation'; // Import useRouter for client-side navigation
import { MUIThemeProvider } from '../context/MUIThemeContext';
import ThemeMUIToggleButton from '../components/ThemeMUIToggleButton';

// Import checkAuth function จากไฟล์ auth ของคุณ
import { checkAuth } from '../lib/api/auth'; // ปรับ path หากจำเป็น

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter(); // สร้าง instance ของ useRouter

  useEffect(() => {
    // ตรวจสอบว่าผู้ใช้ได้เข้าสู่ระบบแล้วหรือไม่
    if (checkAuth()) {
      // หากเข้าสู่ระบบแล้ว ให้นำทางไปยังหน้า Dashboard ทันที
      // ใช้ router.replace เพื่อไม่ให้ผู้ใช้กดปุ่มย้อนกลับแล้วกลับมาหน้า login ได้
      router.replace('/admin/dashboard');
    }
  }, [router]); // ใส่ router ใน dependency array เพื่อให้ effect ทำงานเมื่อ router object มีการเปลี่ยนแปลง (ซึ่งปกติจะไม่ค่อยเกิดขึ้น)

  return (
    <MUIThemeProvider>
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <header className="absolute top-4 right-4">
          <ThemeMUIToggleButton />
        </header>
        {children}
      </div>
    </MUIThemeProvider>
  );
}