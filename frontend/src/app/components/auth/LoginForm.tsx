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
import { useRouter } from 'next/navigation'; // สำหรับการ redirect หลังจาก Login

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
      // **นี่คือส่วนที่คุณจะเรียก API จริงสำหรับการ Login**
      // สำหรับตอนนี้ เราจะจำลองการเรียก API
      const response = await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (username === 'admin' && password === 'admin') {
            resolve({ success: true, message: 'Login successful!' });
          } else {
            reject(new Error('Invalid username or password.'));
          }
        }, 1500); // Simulate network delay
      });

      if ((response as any).success) {
        setSnackbarMessage('Login successful!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        // ใน Production: อาจจะเก็บ Token หรือ Session ใน Local Storage/Cookies
        localStorage.setItem('isLoggedIn', 'true'); // <--- สำคัญ: บันทึกสถานะว่า Login แล้ว
        // แล้ว redirect ไปยังหน้า Dashboard
        onLoginSuccess(); // เรียก callback
        router.push('/admin/dashboard'); // Redirect ไปหน้า Dashboard
      }
    } catch (error: any) {
      setSnackbarMessage(error.message || 'Login failed. Please try again.');
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
          {/* สามารถเพิ่ม Link สำหรับลืมรหัสผ่าน หรือลงทะเบียนได้ที่นี่ */}
          {/* <Typography variant="body2" align="center" mt={2}>
            <Link href="#">ลืมรหัสผ่าน?</Link>
          </Typography>
          <Typography variant="body2" align="center">
            ยังไม่มีบัญชี? <Link href="/register">สมัครสมาชิก</Link>
          </Typography> */}
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