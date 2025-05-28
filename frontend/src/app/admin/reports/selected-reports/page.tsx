// src/app/admin/reports/selected-reports/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import { Box, Typography, CircularProgress, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import PrintableServiceReport from '../../../components/report/PrintableServiceReport';
import { getServiceReportById, getProjectById } from '../../../lib/data';
import { ServiceReport, Project } from '../../../types';

// Import PDF generation libraries
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import dayjs from 'dayjs'; // Ensure dayjs is imported

// Helper function to format date using dayjs
function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return '';
  return dayjs(dateString).format('DD/MM/YYYY');
}

export default function SelectedReportsPage() {
  const searchParams = useSearchParams();
  const reportIdsParam = searchParams.get('ids'); // Get 'ids' from query parameter

  const [reports, setReports] = useState<ServiceReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]); // Store all fetched projects
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!reportIdsParam) {
        setError('No report IDs provided.');
        setLoading(false);
        return;
      }

      const ids = reportIdsParam.split(',');
      if (ids.length === 0) {
        setError('No report IDs provided.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fetchedReports: ServiceReport[] = [];
        const fetchedProjectsMap = new Map<string, Project>(); // Use a Map to avoid duplicate project fetches

        for (const id of ids) {
          console.log(`[SelectedReportsPage] Fetching report with ID: ${id}`);
          const reportData = await getServiceReportById(id);
          if (reportData) {
            console.log(`[SelectedReportsPage] Fetched report ${id}:`, reportData);
            fetchedReports.push(reportData);
            // Fetch project if not already fetched
            if (reportData.projectId) { // Check if projectId exists
              console.log(`[SelectedReportsPage] Report ${id} has projectId: ${reportData.projectId}. Checking if project already fetched.`);
              if (!fetchedProjectsMap.has(reportData.projectId)) {
                console.log(`[SelectedReportsPage] Fetching project for projectId: ${reportData.projectId}`);
                const projectData = await getProjectById(reportData.projectId);
                if (projectData) {
                  console.log(`[SelectedReportsPage] Fetched project ${reportData.projectId}:`, projectData);
                  fetchedProjectsMap.set(reportData.projectId, projectData);
                } else {
                  console.warn(`[SelectedReportsPage] Project with ID ${reportData.projectId} not found for report ${id}.`);
                }
              } else {
                console.log(`[SelectedReportsPage] Project with ID ${reportData.projectId} already fetched.`);
              }
            } else {
              console.warn(`[SelectedReportsPage] Report ${id} has a null or undefined projectId.`);
            }
          } else {
            console.warn(`[SelectedReportsPage] Service Report with ID ${id} not found.`);
          }
        }
        setReports(fetchedReports);
        setProjects(Array.from(fetchedProjectsMap.values())); // Convert Map values to array
        console.log("[SelectedReportsPage] All reports fetched:", fetchedReports);
        console.log("[SelectedReportsPage] All unique projects fetched:", Array.from(fetchedProjectsMap.values()));
      } catch (err) {
        console.error('[SelectedReportsPage] Failed to fetch reports or projects:', err);
        setError('Failed to load selected service reports.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reportIdsParam]); // Re-run effect if reportIdsParam changes

  const handlePrintPdf = async () => {
    if (reportRef.current) {
      const canvas = await html2canvas(reportRef.current, {
        // --- PDF SIZE OPTIMIZATION START ---
        scale: 2, // Reduced scale from 2 to 1.5 for smaller file size. You can try 1 for even smaller.
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        // --- PDF SIZE OPTIMIZATION END ---
      });

      // --- PDF SIZE OPTIMIZATION START ---
      // Convert to JPEG for compression, adjust quality (0.0 - 1.0)
      const imgData = canvas.toDataURL('image/jpeg', 0.8); // Changed to JPEG with 80% quality
      // --- PDF SIZE OPTIMIZATION END ---

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight); // Changed to JPEG
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight); // Changed to JPEG
        heightLeft -= pageHeight;
      }

      // Ensure dayjs is used correctly for filename
      pdf.save(`Service_Reports_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`);
    } else {
      console.error("[SelectedReportsPage] Report reference is null. Cannot generate PDF.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Reports...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  if (reports.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">No service reports found for the selected IDs.</Typography>
      </Box>
    );
  }

  // For the PrintableServiceReport, we need to pass the project associated with the FIRST report
  // or handle multiple projects if the report spans across different projects.
  // For simplicity, let's assume all selected reports belong to the same project or
  // we'll use the project of the first report.
  const firstReportProject = reports[0]?.projectId
    ? projects.find(p => p.id === reports[0].projectId)
    : undefined;
  console.log("[SelectedReportsPage] Project for PrintableServiceReport:", firstReportProject);


  return (
    <Box sx={{ p: 3 }}>
      {/* Print Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PrintIcon />}
          onClick={handlePrintPdf}
        >
          พิมพ์รายงาน PDF
        </Button>
      </Box>

      {/* Hidden component for PDF generation */}
      <div ref={reportRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {/* Pass all fetched reports and the project of the first report (or a common one) */}
        <PrintableServiceReport reports={reports} project={firstReportProject || undefined} />
      </div>

      {/* Display a simplified view of selected reports on screen (optional) */}
      <Typography variant="h5" component="h1" gutterBottom>
        รายงาน Service Report ที่เลือก
      </Typography>
      <TableContainer component={Paper} sx={{ overflowX: 'auto', mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>รหัส</TableCell>
              <TableCell>โปรเจกต์</TableCell>
              <TableCell>วันที่แจ้ง</TableCell>
              <TableCell>Complain</TableCell>
              <TableCell>สาเหตุ</TableCell>
              <TableCell>การแก้ไข</TableCell>
              <TableCell>สถานะ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((reportItem) => {
              const reportProject = projects.find(p => p.id === reportItem.projectId);
              console.log(`[SelectedReportsPage] Display Table - Report ${reportItem.id}: Project ID is ${reportItem.projectId}. Found project:`, reportProject);
              return (
                <TableRow key={reportItem.id}>
                  <TableCell>{reportItem.id}</TableCell>
                  <TableCell>{reportProject?.name || 'N/A'}</TableCell>
                  <TableCell>{formatDate(reportItem.reportDate)}</TableCell>
                  <TableCell>{reportItem.complain}</TableCell>
                  <TableCell>{reportItem.causesOfFailure}</TableCell>
                  <TableCell>{reportItem.actionTaken}</TableCell>
                  <TableCell>{reportItem.status}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="body2" color="text.secondary">
        (เนื้อหาที่แสดงด้านบนเป็นเพียงสรุปย่อ, รายงานฉบับเต็มจะอยู่ในไฟล์ PDF)
      </Typography>
    </Box>
  );
}
