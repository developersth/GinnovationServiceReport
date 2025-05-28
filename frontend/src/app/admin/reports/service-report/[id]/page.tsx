// src/app/admin/reports/service-report/[id]/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import ServiceReportDetail from '../../../../components/report/ServiceReportDetail';
import PrintableServiceReport from '../../../../components/report/PrintableServiceReport';
import { getServiceReportById, getProjectById } // Make sure getProjectById is imported
from '../../../../lib/data';
import { ServiceReport, Project } from '../../../../types';

// Import PDF generation libraries
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ServiceReportPageProps {
  params: {
    id: string; // The ID of the service report from the URL
  };
}

export default function ServiceReportPage({ params }: ServiceReportPageProps) {
  const { id } = params;
  const [report, setReport] = useState<ServiceReport | null>(null);
  const [project, setProject] = useState<Project | null>(null); // Initial state is null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref to the component that needs to be printed (PrintableServiceReport)
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const reportData = await getServiceReportById(id);
        if (reportData) {
          setReport(reportData);
          if (reportData.projectId) {
            const projectData = await getProjectById(reportData.projectId);
            // --- FIX START ---
            setProject(projectData || null); // Convert undefined to null
            // --- FIX END ---
          } else {
            setProject(null); // Explicitly set to null if no projectId
          }
        } else {
          setError('Service Report not found.');
          setReport(null); // Ensure report state is null if not found
          setProject(null); // Ensure project state is null if report not found
        }
      } catch (err) {
        console.error('Failed to fetch service report:', err);
        setError('Failed to load service report details.');
        setReport(null);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  /**
   * Handles the generation and download of the Service Report as a PDF.
   */
  const handlePrintPdf = async () => {
    if (reportRef.current) {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Increase scale for better resolution
        useCORS: true, // Required if images are from a different origin
        logging: true, // Enable logging for debugging
        backgroundColor: '#ffffff', // Explicitly set background color to white for printing
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for millimeters, 'a4' size
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Service_Report_${report?.id || 'detail'}.pdf`);
    } else {
      console.error("Report reference is null. Cannot generate PDF.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Report...</Typography>
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

  if (!report) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Service Report not found.</Typography>
      </Box>
    );
  }

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

      {/* On-screen display of the report */}
      <ServiceReportDetail report={report} project={project || undefined} />

      {/* Hidden component for PDF generation */}
      {/* This div will be rendered but hidden, and html2canvas will capture its content */}
      <div ref={reportRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <PrintableServiceReport report={report} project={project || undefined} />
      </div>
    </Box>
  );
}