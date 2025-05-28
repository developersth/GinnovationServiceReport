// src/components/service/ServiceReportTable.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';

// ตรวจสอบให้แน่ใจว่า ServiceReport ใน types.ts ของคุณมีฟิลด์ครบถ้วนตาม API
import { ServiceReport, Project } from '../../types';
import { combineImageUrl } from '../../lib/utils';

interface ServiceReportTableProps {
  reports: ServiceReport[];
  projects: Project[];
  onEdit: (report: ServiceReport) => void;
  onDelete: (id: string) => void;
  selectedReportIds: string[];
  onSelectReport: (reportId: string, isSelected: boolean) => void;
  onSelectAllReports: (isSelected: boolean) => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getStatusColor = (status: ServiceReport['status']): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'Open':
      return 'error';
    case 'In Progress':
      return 'info';
    case 'Resolved':
      return 'success';
    case 'Complete':
      return 'primary';
    case 'Closed':
      return 'default';
    default:
      return 'default';
  }
};

export default function ServiceReportTable({ reports, projects, onEdit, onDelete, selectedReportIds, onSelectReport, onSelectAllReports }: ServiceReportTableProps) {
  const router = useRouter();
  const safeProjects = projects || [];
  const safeReports = reports || [];

  const [openFullImageModal, setOpenFullImageModal] = React.useState(false);
  const [fullImageUrl, setFullImageUrl] = React.useState<string | null>(null);

  const isAllSelected = safeReports.length > 0 && selectedReportIds.length === safeReports.length;
  const isIndeterminate = selectedReportIds.length > 0 && selectedReportIds.length < safeReports.length;

  const handleOpenFullImageModal = (url: string) => {
    setFullImageUrl(url);
    setOpenFullImageModal(true);
  };

  const handleCloseFullImageModal = () => {
    setOpenFullImageModal(false);
    setFullImageUrl(null);
  };

  const handleViewReport = (reportId: string) => {
    router.push(`/admin/reports/service-report/${reportId}`);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAllReports(event.target.checked);
  };

  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 650 }} aria-label="service report table">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                indeterminate={isIndeterminate}
                checked={isAllSelected}
                onChange={handleSelectAllClick}
                inputProps={{ 'aria-label': 'select all reports' }}
              />
            </TableCell>
            <TableCell>ลำดับ</TableCell>
            <TableCell>รหัส</TableCell>
            <TableCell>โปรเจกต์</TableCell>
            <TableCell>ผู้แจ้ง</TableCell>
            <TableCell>ช่องทาง</TableCell>
            <TableCell>รายละเอียดที่แจ้ง</TableCell>
            <TableCell>สาเหตุ</TableCell>
            <TableCell>การแก้ไข</TableCell>
            <TableCell>รูปภาพ</TableCell>
            <TableCell>วันที่แจ้ง</TableCell>
            <TableCell>สถานะ</TableCell>
            <TableCell align="center">#</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {safeReports.map((report, index) => {
            const projectName = safeProjects.find(p => p.id === report.projectId)?.name || 'N/A';
            const isSelected = selectedReportIds.includes(report.id as string);

            return (
              // The critical part: ensure no whitespace text nodes between <tr> and its <td> children.
              // This is typically done by removing line breaks and excessive spaces between tags,
              // or by making sure the first <td> starts immediately after <tr>.
              <TableRow key={report.id} selected={isSelected}>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    checked={isSelected}
                    onChange={(event) => onSelectReport(report.id as string, event.target.checked)}
                  />
                </TableCell><TableCell>{index + 1}</TableCell>
                <TableCell>{report.id.slice(-6)}</TableCell>
                <TableCell>{projectName}</TableCell>
                <TableCell>{report.reportedBy || 'N/A'}</TableCell>
                <TableCell>{report.channel || 'N/A'}</TableCell>
                <TableCell>{report.complain || 'N/A'}</TableCell>
                <TableCell>{report.causesOfFailure || 'N/A'}</TableCell>
                <TableCell>{report.actionTaken || 'N/A'}</TableCell>
                <TableCell>
                  {report.imagePaths && report.imagePaths.length > 0 ? (
                    report.imagePaths.map((path, i) => (
                      typeof path === 'string' && (
                        <img
                          key={i}
                          src={combineImageUrl(path)}
                          alt={`Image ${i + 1}`}
                          style={{ maxWidth: '50px', marginRight: '5px', cursor: 'pointer' }}
                          onClick={() => handleOpenFullImageModal(combineImageUrl(path))}
                          onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/50x50/cccccc/ffffff?text=No+Image';
                            e.currentTarget.alt = 'Image not available';
                          }}
                        />
                      )
                    ))
                  ) : (
                    <img
                      src="https://placehold.co/50x50/cccccc/ffffff?text=No+Image"
                      alt="No Image"
                      style={{ maxWidth: '50px' }}
                    />
                  )}
                </TableCell>
                <TableCell>{formatDate(report.reportDate)}</TableCell>
                <TableCell>
                  <Chip label={report.status} color={getStatusColor(report.status)} size="small" />
                </TableCell>
                <TableCell align="center">
                  <IconButton aria-label="edit" color="primary" onClick={() => onEdit(report)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" color="error" onClick={() => onDelete(report.id)}>
                    <DeleteIcon />
                  </IconButton>
                 <IconButton aria-label="view" color="info" onClick={() => handleViewReport(report.id as string)}>
                    <PictureAsPdfIcon />
                  </IconButton>
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