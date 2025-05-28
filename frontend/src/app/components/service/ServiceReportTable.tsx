// src/components/service/ServiceReportTable.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility'; // Import Visibility icon for "ดูรายงาน" button
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip'; // Import Chip component
// Removed Box and Typography imports as they are no longer needed for combined cell

import { ServiceReport, Project } from '../../types';
import { formatDate, combineImageUrl } from '../../lib/utils';

interface ServiceReportTableProps {
  reports: ServiceReport[];
  projects: Project[];
  onEdit: (report: ServiceReport) => void;
  onDelete: (id: string) => void;
}

/**
 * Determines the Material-UI Chip color based on the service report status.
 * @param status The status of the service report.
 * @returns A Material-UI color variant string.
 */
const getStatusColor = (status: ServiceReport['status']): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'Open':
      return 'error'; // Red for open issues
    case 'In Progress':
      return 'info'; // Blue for in progress
    case 'Resolved':
      return 'success'; // Green for resolved
    case 'Complete':
      return 'primary'; // Primary color for completed tasks
    case 'Closed':
      return 'default'; // Grey for closed tasks
    default:
      return 'default'; // Fallback to default
  }
};

export default function ServiceReportTable({ reports, projects, onEdit, onDelete }: ServiceReportTableProps) {
  const router = useRouter(); // Initialize useRouter for navigation
  // Safeguard to ensure projects and reports are arrays before use
  const safeProjects = projects || [];
  const safeReports = reports || [];

  // State for controlling the full image preview modal
  const [openFullImageModal, setOpenFullImageModal] = React.useState(false);
  const [fullImageUrl, setFullImageUrl] = React.useState<string | null>(null);

  /**
   * Opens the full image preview modal with the specified image URL.
   * @param url The URL of the image to display.
   */
  const handleOpenFullImageModal = (url: string) => {
    setFullImageUrl(url);
    setOpenFullImageModal(true);
  };

  /**
   * Closes the full image preview modal.
   */
  const handleCloseFullImageModal = () => {
    setOpenFullImageModal(false);
    setFullImageUrl(null);
  };

  /**
   * Navigates to the detailed service report page.
   * @param reportId The ID of the service report to view.
   */
  const handleViewReport = (reportId: string) => {
    router.push(`/admin/reports/service-report/${reportId}`);
  };

  return (
    // Make the TableContainer responsive by allowing horizontal scrolling
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 650 }} aria-label="service report table">
        <TableHead>
          <TableRow>
            <TableCell>รหัส</TableCell>
            <TableCell>โปรเจกต์</TableCell>
            <TableCell>ผู้แจ้ง</TableCell> {/* Re-added */}
            <TableCell>Complain</TableCell> {/* Re-added */}
            <TableCell>สาเหตุ</TableCell> {/* Re-added */}
            <TableCell>การแก้ไข</TableCell> {/* Re-added */}
            <TableCell>ช่องทาง</TableCell>
            <TableCell>รูปภาพ</TableCell>
            <TableCell>วันที่แจ้ง</TableCell>
            <TableCell>สถานะ</TableCell>
            <TableCell align="center">การดำเนินการ</TableCell>
            <TableCell align="center">รายงาน</TableCell> {/* Column for View Report button */}
          </TableRow>
        </TableHead>
        <TableBody>
          {safeReports.map((report) => {
            // Find the project name based on projectId
            const projectName = safeProjects.find(p => p.id === report.projectId)?.name || 'N/A';

            return (
              <TableRow key={report.id}>
                <TableCell>{report.id}</TableCell>
                <TableCell>{projectName}</TableCell>
                <TableCell>{report.reportedBy}</TableCell> {/* Re-added */}
                <TableCell>{report.complain}</TableCell> {/* Re-added */}
                <TableCell>{report.causesOfFailure}</TableCell> {/* Re-added */}
                <TableCell>{report.actionTaken}</TableCell> {/* Re-added */}
                <TableCell>{report.channel}</TableCell>
                <TableCell>
                  {report.imagePaths.map((path, index) => (
                    // Ensure 'path' is a string before passing to combineImageUrl
                    typeof path === 'string' && (
                      <img
                        key={index}
                        src={combineImageUrl(path)}
                        alt={`Image ${index + 1}`}
                        style={{ maxWidth: '50px', marginRight: '5px', cursor: 'pointer' }}
                        onClick={() => handleOpenFullImageModal(combineImageUrl(path))}
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/50x50/cccccc/ffffff?text=No+Image';
                          e.currentTarget.alt = 'Image not available';
                        }}
                      />
                    )
                  ))}
                </TableCell>
                <TableCell>{formatDate(report.reportDate)}</TableCell>
                <TableCell>
                  {/* Display status using Chip with dynamic color */}
                  <Chip label={report.status} color={getStatusColor(report.status)} size="small" />
                </TableCell>
                <TableCell align="center">
                  <IconButton aria-label="edit" color="primary" onClick={() => onEdit(report)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" color="error" onClick={() => onDelete(report.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewReport(report.id as string)}
                  >
                    ดูรายงาน
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Full Image Preview Dialog */}
      <Dialog open={openFullImageModal} onClose={handleCloseFullImageModal} maxWidth="md" fullWidth>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
          {fullImageUrl && (
            <img
              src={fullImageUrl}
              alt="Full Preview"
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFullImageModal} color="primary">
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
}
