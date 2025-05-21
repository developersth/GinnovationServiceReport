// src/app/(auth)/login/page.tsx
'use client';

import * as React from 'react';
import LoginForm from '../../components/auth/LoginForm';
import { useRouter } from 'next/navigation'; // สำหรับการ redirect

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    // เมื่อ Login สำเร็จ, คุณสามารถทำอะไรก็ได้ที่นี่
    // เช่น การบันทึกสถานะการ Login ไว้ใน Context หรือ Redux
    // และ redirect ผู้ใช้ไปยังหน้า Dashboard
    console.log('Login successful! Redirecting to dashboard...');
    // router.push('/admin/dashboard'); // ถูกเรียกใน LoginForm แล้ว
  };

  return (
    <LoginForm onLoginSuccess={handleLoginSuccess} />
  );
}