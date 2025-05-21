// src/context/MUIThemeContext.tsx
'use client';

import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { PaletteMode } from '@mui/material';

// **ต้อง Import Noto Serif Thai จาก @next/font/google อีกครั้งใน Client Component นี้**
// **Import the Prompt font again in this Client Component**
import { Prompt } from 'next/font/google';

const prompt = Prompt({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['thai', 'latin'],
  display: 'swap',
});

interface ColorModeContextType {
  toggleColorMode: () => void;
  mode: PaletteMode;
}

export const ColorModeContext = React.createContext<ColorModeContextType>({
  toggleColorMode: () => {},
  mode: 'light',
});

export function MUIThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<PaletteMode>('light');

  React.useEffect(() => {
    const storedMode = localStorage.getItem('mui-mode') as PaletteMode;
    if (storedMode) {
      setMode(storedMode);
    } else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setMode('dark');
      } else {
        setMode('light');
      }
    }
  }, []);

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('mui-mode', newMode);
          return newMode;
        });
      },
      mode,
    }),
    [mode],
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
        typography: {
          // **นี่คือจุดที่คุณกำหนด font-family ให้กับ Material-UI components**
          fontFamily: prompt.style.fontFamily,
          // คุณสามารถปรับแต่ง typography styles อื่นๆ ได้ที่นี่
          // h1: {
          //   fontSize: '2.5rem',
          //   fontWeight: 700,
          // },
          // body1: {
          //   fontSize: '1rem',
          // },
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  return React.useContext(ColorModeContext);
}