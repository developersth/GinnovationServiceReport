// src/lib/utils.ts

// API_BASE_URL จะถูกดึงมาจากตัวแปรสภาพแวดล้อม
// NEXT_PUBLIC_ เป็น Prefix ที่จำเป็นสำหรับตัวแปรสภาพแวดล้อมที่ต้องการให้เข้าถึงได้ในฝั่ง Client-side ของ Next.js
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://codegenius.trueddns.com:16451/gapi' // Fallback for development

/**
 * รวม URL รูปภาพเข้ากับ Base URL ของ API
 * @param relativePath Path สัมพัทธ์ของรูปภาพ (เช่น /uploads/image.jpg)
 * @returns URL เต็มของรูปภาพ
 */
export function combineImageUrl(relativePath: string): string {
  if (!relativePath) {
    return 'https://placehold.co/120x120/cccccc/ffffff?text=No+Image' // Placeholder image if no path
  }

  // ตรวจสอบว่าเป็น URL เต็มแล้วหรือไม่
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath
  }

  // รวม Base URL กับ Path สัมพัทธ์
  return `${API_BASE_URL}${relativePath}`
}

/**
 * จัดรูปแบบวันที่จากสตริง ISO 8601 ให้เป็นรูปแบบที่อ่านง่าย
 * @param dateString วันที่ในรูปแบบ ISO 8601 (YYYY-MM-DD)
 * @returns วันที่ในรูปแบบ DD/MM/YYYY หรือสตริงว่างเปล่า
 */
export function formatDateBackup(dateString: string): string {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)

    // ใช้ toLocaleDateString เพื่อให้รูปแบบวันที่เป็นไปตาม Local ของผู้ใช้งาน
    // หรือกำหนด options เพื่อควบคุมรูปแบบที่แน่นอน
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)

    return dateString // Return original string if formatting fails
  }
}

export const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // เดือนเริ่มจาก 0
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}
