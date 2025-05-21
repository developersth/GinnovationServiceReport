// src/app/admin/layout.tsx
'use client'; // <-- เพิ่ม 'use client' เนื่องจากเราจะใช้ useRouter และ useState/useEffect

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import { MUIThemeProvider } from '../context/MUIThemeContext';
import ThemeMUIToggleButton from '../components/ThemeMUIToggleButton';
import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout'; // เพิ่มไอคอน Logout
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // เพิ่มไอคอน User Profile (optional)
import Box from '@mui/material/Box'; // เพิ่ม Box สำหรับจัดวาง

import { logout, checkAuth } from '../lib/auth'; // Import ฟังก์ชัน logout และ checkAuth

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // ตรวจสอบสถานะการ Login เมื่อ component mount
    setIsAuthenticated(checkAuth());
    // หากผู้ใช้ไม่ได้ล็อกอิน ให้ redirect ไปหน้า Login
    if (!checkAuth()) {
      router.push('/login');
    }
  }, [router]); // ตรวจสอบ router เพื่อให้แน่ใจว่า effect ทำงานเมื่อ router เปลี่ยน

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      router.push('/login'); // Redirect ไปหน้า Login หลังจาก Logout
    } catch (error) {
      console.error('Logout failed:', error);
      // อาจจะแสดง error message ให้ผู้ใช้ทราบ
    }
  };

  // ถ้ายังไม่ได้รับการยืนยันตัวตน หรือกำลังโหลดอยู่ อาจจะแสดง loading หรือไม่ render อะไรเลย
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p>Loading or redirecting to login...</p>
      </div>
    );
  }

  return (
    <MUIThemeProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 p-4 space-y-4 text-white"> {/* เพิ่ม text-white */}
          <h2 className="text-xl font-bold mb-6">Ginnovation</h2>
          <nav className="space-y-2">
            <Link href="/admin/dashboard" className="block hover:text-blue-400">🏠 Dashboard</Link>
            <Link href="/admin/reports" className="block hover:text-blue-400">📑 Reports</Link>
            <Link href="/admin/users" className="block hover:text-blue-400">👥 Users</Link>
            <Link href="/admin/projects" className="block hover:text-blue-400">📊 Projects</Link>
            <Link href="/admin/services" className="block hover:text-blue-400">🛠️ Service Reports</Link>
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 p-6">
          {/* Topbar */}
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <ThemeMUIToggleButton />
              {/* === ปุ่ม Logout และ User Profile === */}
              <Button
                variant="outlined"
                color="inherit" // ใช้ inherit เพื่อให้ปุ่มเป็นไปตาม Theme (dark/light)
                startIcon={<AccountCircleIcon />}
                sx={{
                  color: 'inherit', // ทำให้สีข้อความเป็นไปตาม theme
                  borderColor: 'rgba(255, 255, 255, 0.5)', // สี border ใน dark mode
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                  },
                }}
              >
                Admin
              </Button>
              <Button
                variant="contained"
                color="error" // ใช้สีแดงสำหรับปุ่ม Logout
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Logout
              </Button>
              {/* ==================================== */}
            </div>
          </header>

          {children}
        </div>
      </div>
    </MUIThemeProvider>
  );
}