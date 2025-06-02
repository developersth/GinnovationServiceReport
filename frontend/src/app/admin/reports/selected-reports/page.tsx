// src/app/admin/reports/selected-reports/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Import useRouter
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import the back arrow icon
import PrintableServiceReport from '../../../components/report/PrintableServiceReport';
import { getServiceReportById, getProjectById, getProjects } from '../../../lib/api/data';
import { ServiceReport, Project } from '../../../types';

// Import PDF generation libraries
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';

// Helper function to format date using dayjs
function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return '';
  return dayjs(dateString).format('DD/MM/YYYY');
}

export default function SelectedReportsPage() {
  const searchParams = useSearchParams();
  const router = useRouter(); // Initialize useRouter
  const reportIdsParam = searchParams.get('ids');

  const [allReports, setAllReports] = useState<ServiceReport[]>([]); // Store all fetched reports
  const [allProjects, setAllProjects] = useState<Project[]>([]); // Store all projects for the combobox
  const [selectedProjectId, setSelectedProjectId] = useState<string>(''); // State for selected project in combobox
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
        const fetchedProjectsMap = new Map<string, Project>();

        // Fetch all projects initially for the combobox
        const projectsData = await getProjects();
        if (projectsData) {
          setAllProjects(projectsData);
          projectsData.forEach(p => fetchedProjectsMap.set(p.id, p));
        }

        for (const id of ids) {
          const reportData = await getServiceReportById(id);
          if (reportData) {
            fetchedReports.push(reportData);
            // Ensure project for this report is in the map, if not already fetched by getAllProjects
            if (reportData.projectId && !fetchedProjectsMap.has(reportData.projectId)) {
              const projectData = await getProjectById(reportData.projectId);
              if (projectData) {
                fetchedProjectsMap.set(reportData.projectId, projectData);
              } else {
                console.warn(`[SelectedReportsPage] Project with ID ${reportData.projectId} not found for report ${id}.`);
              }
            }
          } else {
            console.warn(`[SelectedReportsPage] Service Report with ID ${id} not found.`);
          }
        }
        setAllReports(fetchedReports); // Store all reports
        // If there's a specific project ID in the first report, pre-select it
        if (fetchedReports.length > 0 && fetchedReports[0].projectId) {
          setSelectedProjectId(fetchedReports[0].projectId);
        } else if (projectsData.length > 0) {
          // If no report has a project ID, or no reports, select the first project by default
          // You might want to set a default "All" or no selection here if preferable.
          setSelectedProjectId(projectsData[0].id);
        }
      } catch (err) {
        console.error('[SelectedReportsPage] Failed to fetch reports or projects:', err);
        setError('Failed to load selected service reports.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reportIdsParam]);

  const handleProjectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedProjectId(event.target.value as string);
  };

  const handlePrintPdf = async () => {
    if (reportRef.current) {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.8);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Service_Reports_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`);
    } else {
      console.error("[SelectedReportsPage] Report reference is null. Cannot generate PDF.");
    }
  };

  const handleBackClick = () => {
    router.back(); // Go back to the previous page
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

  if (allReports.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">No service reports found for the selected IDs.</Typography>
      </Box>
    );
  }

  // Find the project for the PrintableServiceReport based on selectedProjectId
  // This ensures the PDF header reflects the chosen project from the combobox
  const projectForPrintableReport = allProjects.find(p => p.id === selectedProjectId);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1">
          รายงาน Service Report ที่เลือก
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Back Button */}
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackClick}
          >
            ย้อนกลับ
          </Button>

          {/* Project Combobox */}
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="project-select-label">เลือกโปรเจกต์</InputLabel>
            <Select
              labelId="project-select-label"
              id="project-select"
              value={selectedProjectId}
              label="เลือกโปรเจกต์"
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              {allProjects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Print Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={handlePrintPdf}
          >
            พิมพ์รายงาน PDF
          </Button>
        </Box>
      </Box>

      {/* Hidden component for PDF generation */}
      <div ref={reportRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {/* Pass ALL fetched reports to PrintableServiceReport, but the project for its header comes from selectedProjectId */}
        <PrintableServiceReport reports={allReports} project={projectForPrintableReport || undefined} />
      </div>

      {/* Display a simplified view of selected reports on screen (optional) */}
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
            {/* Now mapping over allReports, not displayedReports */}
            {allReports.map((reportItem) => {
              const reportProject = allProjects.find(p => p.id === reportItem.projectId);
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