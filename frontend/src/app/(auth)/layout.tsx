// src/app/(auth)/layout.tsx
import { ReactNode } from 'react';
import { MUIThemeProvider } from '../context/MUIThemeContext';
import ThemeMUIToggleButton from '../components/ThemeMUIToggleButton';

export default function AuthLayout({ children }: { children: ReactNode }) {
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