// src/components/ThemeMUIToggleButton.tsx
'use client'; // This is a Client Component

import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Icon for dark mode
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Icon for light mode
import { useTheme } from '@mui/material/styles'; // Use MUI's useTheme hook
import { useColorMode } from '../context/MUIThemeContext'; // Our custom hook

export default function ThemeMUIToggleButton() {
  const theme = useTheme(); // MUI's useTheme hook to get the current MUI theme
  const { toggleColorMode } = useColorMode(); // Our custom hook to toggle the mode

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default', // Background color from MUI theme
        color: 'text.primary', // Text color from MUI theme
        borderRadius: 1,
        p: 1,
      }}
    >
      {/* {theme.palette.mode} mode */}
      <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
        {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Box>
  );
}