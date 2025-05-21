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

import { logout, checkAuth } from '../lib/auth';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to manage sidebar visibility

  useEffect(() => {
    setIsAuthenticated(checkAuth());
    if (!checkAuth()) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
        {/* Mobile Overlay for Sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 p-4 space-y-4 text-white
                      transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                      md:relative md:translate-x-0 md:flex-shrink-0 md:block
                      transition-transform duration-300 ease-in-out`}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Ginnovation</h2>
            {/* Close button for mobile sidebar: visible only on xs, hidden on md and up */}
            <IconButton
              onClick={toggleSidebar}
              sx={{ display: { xs: 'block', md: 'none' } }} // Explicitly hide on md and up using MUI sx prop
              className="text-white" // Keep text-white for mobile
              aria-label="close sidebar"
            >
              <CloseIcon />
            </IconButton>
          </div>
          <nav className="space-y-2">
            <Link href="/admin/dashboard" className="block hover:text-blue-400" onClick={toggleSidebar}>🏠 Dashboard</Link>
            <Link href="/admin/reports" className="block hover:text-blue-400" onClick={toggleSidebar}>📑 Reports</Link>
            <Link href="/admin/users" className="block hover:text-blue-400" onClick={toggleSidebar}>👥 Users</Link>
            <Link href="/admin/projects" className="block hover:text-blue-400" onClick={toggleSidebar}>📊 Projects</Link>
            <Link href="/admin/services" className="block hover:text-blue-400" onClick={toggleSidebar}>🛠️ Service Reports</Link>
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Topbar */}
          <header className="flex justify-end items-center p-4 bg-white dark:bg-gray-700 shadow-md md:justify-end">
            {/* Hamburger menu: visible only on xs (mobile), hidden on md and up */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }} className="mr-auto">
              <IconButton
                onClick={toggleSidebar}
                color="inherit" // Use inherit to match theme text color
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
                Admin
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </MUIThemeProvider>
  );
}
