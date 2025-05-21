// src/lib/auth.ts

// ฟังก์ชันสำหรับจำลองการ Login (ใช้ใน LoginForm.tsx)
export const login = async (username: string, password: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username === 'admin' && password === 'admin') {
        // ใน Production: เก็บ token หรือ session ID
        localStorage.setItem('isLoggedIn', 'true'); // ตัวอย่างการเก็บสถานะ
        resolve(true);
      } else {
        reject(new Error('Invalid username or password.'));
      }
    }, 1000);
  });
};

// ฟังก์ชันสำหรับจำลองการ Logout
export const logout = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.removeItem('isLoggedIn'); // ลบสถานะการ Login
      console.log('Logged out successfully.');
      resolve();
    }, 500);
  });
};

// ฟังก์ชันสำหรับตรวจสอบสถานะการ Login (อาจจะใช้ในการป้องกัน route)
export const checkAuth = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true';
};