// src/types/index.ts

// Project interface (ของเดิม)
export interface Project {
  id: string; // รหัสโปรเจกต์ (UUID หรือ ID ที่สร้างขึ้น)
  name: string; // ชื่อโปรเจกต์
  imageUrl: string; // URL ของรูปภาพ
}


// **เพิ่ม User interface ใหม่**
export interface User {
  id: string;      // รหัสผู้ใช้งาน (UUID หรือ ID ที่สร้างขึ้น)
  name: string;    // ชื่อผู้ใช้งาน
  email: string;   // อีเมล
  role: 'admin' | 'editor' | 'viewer'; // บทบาทของผู้ใช้งาน
}

// src/types/index.ts
export interface ServiceReport {
  id: string; // รหัส Service Report (UUID หรือ ID ที่สร้างขึ้น)
  projectId: string; // รหัสโปรเจกต์ที่เกี่ยวข้อง
  reporter: string; // ผู้แจ้ง
  complain: string; // Complain/ปัญหาที่แจ้ง
  causesOfFailure: string; // สาเหตุของปัญหา
  actionTaken: string; // การแก้ไข/ดำเนินการที่ทำ
  channel: string; // ช่องทางการแจ้ง (เช่น โทรศัพท์, อีเมล, Line)
  imageUrls: string[]; // URLs ของรูปภาพที่แนบ (Array)
  reportDate: string; // วันที่แจ้ง (ISO 8601 format: YYYY-MM-DD)
  status: 'open' | 'in progress' | 'resolved' | 'closed'; // สถานะ
}