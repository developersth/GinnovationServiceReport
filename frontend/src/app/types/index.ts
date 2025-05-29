// src/types/index.ts

export interface Project {
  id: string;
  name: string;
  imageUrl: string;
  imageFile?: File;

  customerName: string;
  customerAddress: string;
  contactPerson: string;
  tel: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface ServiceReport {
  id: string; // รหัส Service Report (UUID หรือ ID ที่สร้างขึ้น)
  projectId: string; // รหัสโปรเจกต์ที่เกี่ยวข้อง
  reportedBy: string; // ผู้แจ้ง
  complain: string; // Complain/ปัญหาที่แจ้ง
  causesOfFailure: string; // สาเหตุของปัญหา
  actionTaken: string; // การแก้ไข/ดำเนินการที่ทำ
  channel: string; // ช่องทางการแจ้ง (เช่น โทรศัพท์, อีเมล, Line)
  imagePaths: (string | File)[]; // <--- เปลี่ยนจาก imageUrls เป็น imagePaths และรองรับ File object
  reportDate: string; // วันที่แจ้ง (ISO 8601 format: YYYY-MM-DD)
  createdBy: string; 
  createdAt: string; 
  updatedBy: string; 
  updatedAt: string; 
  status: 'Open' | 'In Progress' | 'Resolved'| 'Complete' | 'Closed'; // สถานะ
}
