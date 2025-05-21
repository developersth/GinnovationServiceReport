// src/lib/utils.ts
import dayjs from 'dayjs';
import 'dayjs/locale/th';

dayjs.locale('th');

// --- ต้องมี 'export' หน้า const API_BASE_URL ---
export const API_BASE_URL = 'https://localhost:7001'; // เปลี่ยนเป็น URL API จริงของคุณ
// ---------------------------------------------------------------

export function formatDate(dateString: string): string {
  if (!dateString) {
    return '';
  }
  return dayjs(dateString).format('D MMMM BBBB');
}

export function combineImageUrl(relativePath: string): string {
  if (!relativePath) {
    return '';
  }
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;

  return `${baseUrl}/${path}`;
}

export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}