// src/lib/data.ts
import { Project, User, ServiceReport } from '../types';
import { API_BASE_URL } from './utils';

// --- เปลี่ยนไปใช้ API จริงสำหรับ Projects (ไม่มี Mock Data Fallback) ---

export async function getProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/api/Project`);
  if (!response.ok) {
    // โยน Error ตรงๆ ถ้า API มีปัญหา
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

export async function addProject(project: Omit<Project, 'id'>): Promise<Project> {
  const formData = new FormData();
  formData.append('name', project.name);

  if (project.imageFile) {
    formData.append('Image', project.imageFile, project.imageFile.name);
  } else if (project.imageUrl) {
    // ถ้ามี imageUrl เดิม (กรณี update ที่ไม่ได้เปลี่ยนรูป)
    formData.append('imageUrl', project.imageUrl); // ส่ง imageUrl ไปด้วย
  }


  const response = await fetch(`${API_BASE_URL}/api/Project`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, Body: ${errorBody}`);
  }
  return await response.json();
}

export async function updateProject(updatedProject: Project): Promise<Project> {
  const formData = new FormData();
  formData.append('id', updatedProject.id);
  formData.append('name', updatedProject.name);

  if (updatedProject.imageFile) {
    formData.append('Image', updatedProject.imageFile, updatedProject.imageFile.name);
  } else if (updatedProject.imageUrl) {
    // ถ้าไม่มีไฟล์ใหม่ แต่มี imageUrl เดิม
    formData.append('imageUrl', updatedProject.imageUrl); // ส่ง imageUrl ไปด้วย
  } else {
    // ถ้าไม่มีรูปภาพเลย (ถูกลบออกไป)
    // คุณอาจจะต้องส่ง flag พิเศษไปบอก Backend ว่าให้ลบรูปภาพ
    // หรือ Backend อาจจะถือว่าถ้า Image และ imageUrl ไม่ถูกส่งมาก็คือไม่มีรูป
    // สำหรับตอนนี้เราจะส่ง imageUrl เป็น empty string ไป
    formData.append('imageUrl', '');
  }

  const response = await fetch(`${API_BASE_URL}/api/Project/${updatedProject.id}`, {
    method: 'PUT',
    body: formData,
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, Body: ${errorBody}`);
  }
  return updatedProject;
}

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/Project/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const response = await fetch(`${API_BASE_URL}/api/Project/${id}`);
  if (response.status === 404) {
    return undefined;
  }
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

// --- เปลี่ยนไปใช้ API จริงสำหรับ Users (ไม่มี Mock Data Fallback) ---

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/api/User`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

export async function addUser(user: Omit<User, 'id'>): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/User`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

export async function updateUser(updatedUser: User): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/User/${updatedUser.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedUser),
  });
  if (!response.ok) {
    if (response.status === 204) {
      return updatedUser;
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

export async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/User/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

export async function getUserById(id: string): Promise<User | undefined> {
  const response = await fetch(`${API_BASE_URL}/api/User/${id}`);
  if (response.status === 404) {
    return undefined;
  }
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

// --- เปลี่ยนไปใช้ API จริงสำหรับ Service Reports (ไม่มี Mock Data Fallback) ---

export async function getServiceReports(): Promise<ServiceReport[]> {
  const response = await fetch(`${API_BASE_URL}/api/ServiceReport`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

// --- IMPORTANT: Updated addServiceReport for multipart/form-data with imagePaths ---
export async function addServiceReport(report: Omit<ServiceReport, 'id'>): Promise<ServiceReport> {
  const formData = new FormData();

  // Append text fields with 'reportDto.' prefix to match backend's [FromForm] ServiceReportDto
  formData.append('reportDto.projectId', report.projectId);
  formData.append('reportDto.reportedBy', report.reportedBy);
  formData.append('reportDto.complain', report.complain);
  formData.append('reportDto.causesOfFailure', report.causesOfFailure);
  formData.append('reportDto.actionTaken', report.actionTaken);
  formData.append('reportDto.channel', report.channel);
  formData.append('reportDto.reportDate', report.reportDate);
  formData.append('reportDto.status', report.status);

  // Append image files
  report.imagePaths.forEach((item) => {
    if (item instanceof File) {
      formData.append(`images`, item, item.name); // 'images' must match the backend parameter `List<IFormFile>? images`
    }
  });

  // --- FIX START ---
  // Change the endpoint to match your backend's CreateWithImages action
  const response = await fetch(`${API_BASE_URL}/api/ServiceReport`, {
  // --- FIX END ---
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, Body: ${errorBody}`);
  }
  return await response.json();
}

// --- IMPORTANT: Corrected updateServiceReport for multipart/form-data ---
export async function updateServiceReport(updatedReport: ServiceReport): Promise<ServiceReport> {
  const formData = new FormData();

  // Append ServiceReportDto text fields with 'reportDto.' prefix
  // These names must match the properties in your ServiceReportDto in C#
  // Example: [FromForm] ServiceReportDto reportDto in backend
  formData.append('reportDto.projectId', updatedReport.projectId);
  formData.append('reportDto.reportedBy', updatedReport.reportedBy);
  formData.append('reportDto.complain', updatedReport.complain);
  formData.append('reportDto.causesOfFailure', updatedReport.causesOfFailure);
  formData.append('reportDto.actionTaken', updatedReport.actionTaken);
  formData.append('reportDto.channel', updatedReport.channel);
  formData.append('reportDto.reportDate', updatedReport.reportDate);
  formData.append('reportDto.status', updatedReport.status);

  // Separate new files from existing paths
  const newFilesToUpload = updatedReport.imagePaths.filter(item => item instanceof File) as File[];
  const existingImagePaths = updatedReport.imagePaths.filter(item => typeof item === 'string') as string[];

  // Append new image files to the 'images' parameter
  newFilesToUpload.forEach((file) => {
    formData.append(`images`, file, file.name); // 'images' must match backend parameter `List<IFormFile>? images`
  });

  // Append existing image paths to the 'ImagePaths' property of the ServiceReportDto
  // This is how you send a List<string> via FormData for a DTO property
  existingImagePaths.forEach((path, index) => {
    formData.append(`reportDto.imagePaths[${index}]`, path); // Matches ServiceReportDto.ImagePaths
  });

  // The PUT endpoint for ServiceReport should be /api/ServiceReport/{id}
  // And the backend method signature is `UpdateWithImages(string id, [FromForm] ServiceReportDto reportDto, [FromForm] List<IFormFile>? images)`
  const response = await fetch(`${API_BASE_URL}/api/ServiceReport/${updatedReport.id}`, {
    method: 'PUT',
    // Do NOT set 'Content-Type' header here; fetch will set it automatically for FormData
    body: formData, // Send FormData directly
  });

  if (!response.ok) {
    if (response.status === 204) {
      return updatedReport;
    }
    const errorBody = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, Body: ${errorBody}`);
  }
  // If backend returns 204 No Content, return updatedReport
  // If backend returns 200 OK with body, await response.json()
  return updatedReport; // Assuming 204 No Content or similar
}

// --- New: getServiceReportById function ---
export async function getServiceReportById(id: string): Promise<ServiceReport | undefined> {
  const response = await fetch(`${API_BASE_URL}/api/ServiceReport/${id}`);
  if (response.status === 404) {
    return undefined;
  }
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

export async function deleteServiceReport(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/ServiceReport/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}
