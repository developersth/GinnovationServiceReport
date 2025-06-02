// src/app/admin/layout.tsx
'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MUIThemeProvider } from '../context/MUIThemeContext';
import ThemeMUIToggleButton from '../components/ThemeMUIToggleButton';
import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import Image from 'next/image';

import { logout, checkAuth, getUsername } from '../lib/api/auth';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const authenticateUser = async () => {
      setIsLoadingAuth(true);
      const authStatus = checkAuth();

      if (authStatus) {
        setIsAuthenticated(true);
        setCurrentUsername(getUsername());
      } else {
        setIsAuthenticated(false);
        router.push('/login');
      }
      setIsLoadingAuth(false);
    };

    authenticateUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      setCurrentUsername(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isLoadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <CircularProgress color="primary" sx={{ mb: 2 }} />
        <p>กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
        <p>หากไม่ถูกต้องจะเปลี่ยนเส้นทางไปหน้าเข้าสู่ระบบ</p>
      </div>
    );
  }

  if (!isAuthenticated && !isLoadingAuth) {
    return null;
  }

  return (
    <MUIThemeProvider>
      <div className="flex min-h-screen" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* Overlay for Mobile Sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden print:hidden"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 p-4 space-y-4 text-white shadow-lg
                      transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                      md:relative md:translate-x-0 md:flex-shrink-0 md:block
                      transition-transform duration-300 ease-in-out
                      print:hidden`}
        >
          <div className="flex justify-between items-center mb-6">
            <Link href="/admin/dashboard">
              <Image
                src="/images/g-logo.png"
                alt="Your Company Logo"
                width={120}
                height={40}
                priority
              />
            </Link>
            <IconButton
              onClick={toggleSidebar}
              sx={{ display: { xs: 'block', md: 'none' } }}
              className="text-white"
              aria-label="close sidebar"
            >
              <CloseIcon />
            </IconButton>
          </div>
          <nav className="space-y-2">
            <Link href="/admin/dashboard" className="block hover:text-blue-400" onClick={toggleSidebar}>🏠 แดชบอร์ด</Link>
            <Link href="/admin/users" className="block hover:text-blue-400" onClick={toggleSidebar}>👥 ผู้ใช้งาน</Link>
            <Link href="/admin/projects" className="block hover:text-blue-400" onClick={toggleSidebar}>📊 โปรเจกต์</Link>
            <Link href="/admin/services" className="block hover:text-blue-400" onClick={toggleSidebar}>🛠️ รายงานบริการ</Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Topbar */}
          <header className="flex justify-end items-center p-4 bg-white dark:bg-gray-700 shadow-md md:justify-end print:hidden">
            <Box sx={{ display: { xs: 'block', md: 'none' } }} className="mr-auto z-50">
              <IconButton
                onClick={toggleSidebar}
                color="inherit"
                aria-label="open sidebar"
              >
                <MenuIcon />
              </IconButton>
            </Box>
            <div className="flex items-center space-x-4">
              <ThemeMUIToggleButton />
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<AccountCircleIcon />}
                sx={{
                  color: 'inherit',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                  },
                }}
              >
                {currentUsername || 'ผู้ใช้งาน'}
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                ออกจากระบบ
              </Button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </MUIThemeProvider>
  );
}
