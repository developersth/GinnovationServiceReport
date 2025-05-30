// src/app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';

// Import ทั้ง ServiceReport และ Project types
import { getServiceReports, getProjects } from '../../lib/api/data';
import { ServiceReport, Project } from '../../types';

// --- API Calls ---

// Function to process data for "Reports by Project" chart
// MODIFIED: รับ reports และ projects เป็น argument
const getReportsByProjectData = (reports: ServiceReport[], projects: Project[]) => {
  // สร้าง Map สำหรับค้นหาชื่อ Project จาก ID ได้อย่างรวดเร็ว
  const projectMap = new Map<string, string>();
  projects.forEach(project => {
    projectMap.set(project.id, project.name);
  });

  const projectCounts: { [key: string]: number } = {};
  reports.forEach(report => {
    // ใช้ projectId ไปหาชื่อ Project จาก projectMap
    const projectName = projectMap.get(report.projectId) || 'Unknown Project'; // ให้ค่าเริ่มต้นถ้าหาไม่เจอ
    projectCounts[projectName] = (projectCounts[projectName] || 0) + 1;
  });

  return Object.keys(projectCounts).map(projectName => ({
    name: projectName,
    reports: projectCounts[projectName],
  }));
};

// Function to process data for "Reports by Month" chart (ไม่เปลี่ยนแปลง)
const getReportsByMonthData = (reports: ServiceReport[]) => {
  const monthCounts: { [key: string]: number } = {};
  const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]; // Changed to Thai month abbreviations

  reports.forEach(report => {
    const monthIndex = new Date(report.reportDate).getMonth();
    const month = monthNames[monthIndex];
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });

  // Ensure all months are present, even if no reports for that month, to maintain order for the chart
  return monthNames.map(month => ({
    name: month,
    reports: monthCounts[month] || 0,
  }));
};

export default function DashboardPage() {
  const [serviceReports, setServiceReports] = useState<ServiceReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]); // NEW: State สำหรับเก็บข้อมูล Project
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => { // เปลี่ยนชื่อฟังก์ชันเป็น loadData เพราะดึงหลายอย่าง
      try {
        setLoading(true); // ตั้งค่า loading เป็น true ก่อนเริ่มดึงข้อมูล
        // ดึงข้อมูล Service Reports และ Projects พร้อมกัน (concurrently)
        const [reportsData, projectsData] = await Promise.all([
          getServiceReports(),
          getProjects() // NEW: ดึงข้อมูล Projects ด้วย
        ]);
        setServiceReports(reportsData);
        setProjects(projectsData); // NEW: ตั้งค่า state ของ Projects
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // --- New: Function to get the chart year ---
  const getChartYear = () => {
    if (serviceReports && serviceReports.length > 0) {
      // Assuming 'reportDate' is a property in your ServiceReport objects
      const firstReportDate = serviceReports[0].reportDate;
      if (firstReportDate) {
        return new Date(firstReportDate).getFullYear();
      }
    }
    // Fallback to the current year if no reports or reportDate is found
    return new Date().getFullYear();
  };
  // --- End New: Function to get the chart year ---

  // ส่งข้อมูล projects ไปให้ getReportsByProjectData
  const reportsByProjectData = getReportsByProjectData(serviceReports, projects);
  const reportsByMonthData = getReportsByMonthData(serviceReports);
  const chartYear = getChartYear(); // Call the function to get the year

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2, color: 'text.primary' }}>กำลังโหลดข้อมูล...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">ข้อผิดพลาด: {error}</Alert>
      </Box>
    );
  }

  return (
    <div className="p-4">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow text-white">
          <p className="text-sm text-gray-400">จำนวนรายงานบริการทั้งหมด</p>
          <p className="text-2xl font-bold">{serviceReports.length}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow text-white">
          <p className="text-sm text-gray-400">จำนวนโครงการที่รับบริการ (ไม่ซ้ำกัน)</p>
          <p className="text-2xl font-bold">{reportsByProjectData.length}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow text-white">
          <p className="text-sm text-gray-400">สถานะล่าสุด</p>
          <p className="text-2xl font-bold">อัปเดตแล้ว</p>
        </div>
      </section>

      <section className="bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4 text-white">รายงานบริการตามโครงการ</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={reportsByProjectData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey="name" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip
              contentStyle={{ background: '#333', border: '1px solid #555', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ color: '#fff' }} />
            <Bar dataKey="reports" name="Reports" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 text-white">รายงานบริการรายเดือน (ปี {chartYear})</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={reportsByMonthData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey="name" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip
              contentStyle={{ background: '#333', border: '1px solid #555', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ color: '#fff' }} />
            <Bar dataKey="reports" name="Reports" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}