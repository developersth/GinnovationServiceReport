// src/lib/data.ts
import { Project, User } from '../types'; // เพิ่ม User เข้ามา

// --- Mock Data สำหรับ Projects (ของเดิม) ---
let projects: Project[] = [
  { id: 'proj-001', name: 'Website Portfolio', imageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Project1' },
  { id: 'proj-002', name: 'Mobile App Design', imageUrl: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Project2' },
  { id: 'proj-003', name: 'E-commerce Platform', imageUrl: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Project3' },
];

export async function getProjects(): Promise<Project[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(projects);
    }, 300);
  });
}

export async function addProject(project: Omit<Project, 'id'>): Promise<Project> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        ...project,
      };
      projects.push(newProject);
      resolve(newProject);
    }, 300);
  });
}

export async function updateProject(updatedProject: Project): Promise<Project> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = projects.findIndex((p) => p.id === updatedProject.id);
      if (index !== -1) {
        projects[index] = updatedProject;
        resolve(updatedProject);
      } else {
        reject(new Error('Project not found'));
      }
    }, 300);
  });
}

export async function deleteProject(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = projects.length;
      projects = projects.filter((p) => p.id !== id);
      if (projects.length < initialLength) {
        resolve();
      } else {
        reject(new Error('Project not found'));
      }
    }, 300);
  });
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const project = projects.find((p) => p.id === id);
      resolve(project);
    }, 300);
  });
}

// --- **เพิ่ม Mock Data สำหรับ Users (ใหม่)** ---
let users: User[] = [
  { id: 'user-001', name: 'Alice Smith', email: 'alice@example.com', role: 'admin' },
  { id: 'user-002', name: 'Bob Johnson', email: 'bob@example.com', role: 'editor' },
  { id: 'user-003', name: 'Charlie Brown', email: 'charlie@example.com', role: 'viewer' },
];

export async function getUsers(): Promise<User[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(users);
    }, 300);
  });
}

export async function addUser(user: Omit<User, 'id'>): Promise<User> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser: User = {
        id: `user-${Date.now()}`, // สร้าง ID ง่ายๆ
        ...user,
      };
      users.push(newUser);
      resolve(newUser);
    }, 300);
  });
}

export async function updateUser(updatedUser: User): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = users.findIndex((u) => u.id === updatedUser.id);
      if (index !== -1) {
        users[index] = updatedUser;
        resolve(updatedUser);
      } else {
        reject(new Error('User not found'));
      }
    }, 300);
  });
}

export async function deleteUser(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = users.length;
      users = users.filter((u) => u.id !== id);
      if (users.length < initialLength) {
        resolve();
      } else {
        reject(new Error('User not found'));
      }
    }, 300);
  });
}

export async function getUserById(id: string): Promise<User | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = users.find((u) => u.id === id);
      resolve(user);
    }, 300);
  });
}