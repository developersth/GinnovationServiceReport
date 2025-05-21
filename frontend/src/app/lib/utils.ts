// src/lib/utils.ts
import dayjs from 'dayjs';
import 'dayjs/locale/th'; // Import locale Thai (ถ้าต้องการรูปแบบวันที่ภาษาไทย)

// ตั้งค่า locale เป็นภาษาไทยทั่วโลกสำหรับ dayjs
dayjs.locale('th');

/**
 * Formats a date string into a readable format.
 * @param dateString The date string (e.g., 'YYYY-MM-DD').
 * @returns Formatted date string (e.g., '22 พฤษภาคม 2567' or 'May 22, 2024').
 */
export function formatDate(dateString: string): string {
  if (!dateString) {
    return '';
  }
  // คุณสามารถปรับรูปแบบวันที่ได้ตามต้องการ
  // เช่น 'D MMMM YYYY' สำหรับ '22 พฤษภาคม 2567' (ภาษาไทย)
  // หรือ 'MMM D, YYYY' สำหรับ 'May 22, 2024' (ภาษาอังกฤษ)
  return dayjs(dateString).format('D MMMM BBBB'); // BBBB สำหรับปีพุทธศักราช 2567
  // หรือใช้ 'D MMMM YYYY' ถ้าต้องการปีคริสต์ศักราช
}

// ตัวอย่างฟังก์ชัน utility อื่นๆ ที่คุณอาจเพิ่มในอนาคต:
/**
 * Generates a random ID. (Example)
 * @returns A random string ID.
 */
export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}