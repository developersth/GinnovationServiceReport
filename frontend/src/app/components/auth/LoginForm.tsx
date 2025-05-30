// src/components/auth/LoginForm.tsx
'use client';

import * as React from 'react';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/navigation';

// IMPORT THE ACTUAL LOGIN FUNCTION
import { login } from '../../lib/api/auth'; // Adjust path if auth.ts is located differently

// ฟังก์ชัน Alert สำหรับ Snackbar
function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      // **REPLACE SIMULATED LOGIN WITH ACTUAL API CALL**
      const success = await login(username, password); // Call your actual login function

      if (success) {
        setSnackbarMessage('เข้าสู่ระบบสำเร็จ!'); // Login successful message
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        // Your login function in auth.ts already handles localStorage.setItem('isLoggedIn', 'true');
        // and storing token, username, displayName.
        // So, no need to set isLoggedIn here again.

        onLoginSuccess(); // Call the callback provided by the parent component
        router.push('/admin/dashboard'); // Redirect to Dashboard
      } else {
        // This 'else' block might not be reached if your login function throws an error directly
        // rather than returning 'false' on failure. The catch block will usually handle errors.
        setSnackbarMessage('เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error: any) {
      // Handle errors from the login function (e.g., network issues, invalid credentials from API)
      const errorMessage = error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Card sx={{ minWidth: 300, maxWidth: 400, p: 3, borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" component="h1" align="center" gutterBottom sx={{ mb: 3 }}>
          เข้าสู่ระบบ Ginnovation
        </Typography>
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="ชื่อผู้ใช้"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="รหัสผ่าน"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'เข้าสู่ระบบ'}
          </Button>
        </Box>
      </CardContent>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
}