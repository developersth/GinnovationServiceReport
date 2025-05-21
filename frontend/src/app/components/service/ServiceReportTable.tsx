// src/components/service/ServiceReportTable.tsx
'use client';

import * as React from 'react';
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
import { ServiceReport } from '../../types';
import { formatDate } from '../../lib/utils'; // สมมติว่ามี utility function สำหรับ format วันที่

interface ServiceReportTableProps {
  reports: ServiceReport[];
  onEdit: (report: ServiceReport) => void;
  onDelete: (id: string) => void;
}

export default function ServiceReportTable({ reports, onEdit, onDelete }: ServiceReportTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="service report table">
        <TableHead>
          <TableRow>
            <TableCell>รหัส</TableCell>
            <TableCell>โปรเจกต์</TableCell>
            <TableCell>ผู้แจ้ง</TableCell>
            <TableCell>Complain</TableCell>
            <TableCell>สาเหตุ</TableCell>
            <TableCell>การแก้ไข</TableCell>
            <TableCell>ช่องทาง</TableCell>
            <TableCell>รูปภาพ</TableCell>
            <TableCell>วันที่แจ้ง</TableCell>
            <TableCell>สถานะ</TableCell>
            <TableCell align="center">การดำเนินการ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{report.id}</TableCell>
              <TableCell>{report.projectId}</TableCell> {/* ควรดึงชื่อโปรเจกต์จาก ID */}
              <TableCell>{report.reporter}</TableCell>
              <TableCell>{report.complain}</TableCell>
              <TableCell>{report.causesOfFailure}</TableCell>
              <TableCell>{report.actionTaken}</TableCell>
              <TableCell>{report.channel}</TableCell>
              <TableCell>
                {report.imageUrls.map((url, index) => (
                  <img key={index} src={url} alt={`Image ${index + 1}`} style={{ maxWidth: '50px', marginRight: '5px' }} />
                ))}
              </TableCell>
             <TableCell>{formatDate(report.reportDate)}</TableCell> {/* <--- ใช้งาน formatDate ตรงนี้ */}
              <TableCell>{report.status}</TableCell>
              <TableCell align="center">
                <IconButton aria-label="edit" color="primary" onClick={() => onEdit(report)}>
                  <EditIcon />
                </IconButton>
                <IconButton aria-label="delete" color="error" onClick={() => onDelete(report.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}