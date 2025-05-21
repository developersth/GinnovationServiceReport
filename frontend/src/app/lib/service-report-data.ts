// src/lib/data.ts
import { ServiceReport, Project } from '../types';

// Mock Data สำหรับ Projects (สำหรับ dropdown ใน Form)
let projects: Project[] = [
  { id: 'proj-001', name: 'Website Portfolio', imageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Project1' },
  { id: 'proj-002', name: 'Mobile App Design', imageUrl: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Project2' },
  { id: 'proj-003', name: 'E-commerce Platform', imageUrl: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Project3' },
];

// Mock Data สำหรับ Service Reports
let serviceReports: ServiceReport[] = [
  {
    id: 'sr-001',
    projectId: 'proj-001',
    reporter: 'John Doe',
    complain: 'หน้าเว็บแสดงผลผิดพลาด',
    causesOfFailure: 'CSS ไม่ถูกต้อง',
    actionTaken: 'แก้ไข CSS',
    channel: 'โทรศัพท์',
    imageUrls: ['https://via.placeholder.com/150'],
    reportDate: '2024-05-22',
    status: 'resolved',
  },
  // ... เพิ่มข้อมูล Service Report อื่นๆ
];

// ฟังก์ชันสำหรับ Projects (สำหรับ dropdown)
export const getProjects = (): Promise<Project[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(projects);
    }, 300);
  });
};

// ฟังก์ชัน CRUD สำหรับ Service Reports
export const getServiceReports = (): Promise<ServiceReport[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(serviceReports);
    }, 300);
  });
};

export const addServiceReport = (report: Omit<ServiceReport, 'id'>): Promise<ServiceReport> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newReport: ServiceReport = { id: `sr-${Date.now()}`, ...report };
      serviceReports.push(newReport);
      resolve(newReport);
    }, 300);
  });
};

export const updateServiceReport = (report: ServiceReport): Promise<ServiceReport> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = serviceReports.findIndex((sr) => sr.id === report.id);
      if (index !== -1) {
        serviceReports[index] = report;
        resolve(report);
      } else {
        reject(new Error('Service Report not found'));
      }
    }, 300);
  });
};

export const deleteServiceReport = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      serviceReports = serviceReports.filter((sr) => sr.id !== id);
      resolve();
    }, 300);
  });
};