// src/components/project/ProjectTable.tsx
'use client'; // Client Component เพราะใช้ state, event handlers

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
import Avatar from '@mui/material/Avatar';
import { Project } from '../../types';
import { combineImageUrl } from '../../lib/utils'; // <--- เพิ่มการ import นี้

interface ProjectTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export default function ProjectTable({ projects, onEdit, onDelete }: ProjectTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="project table">
        <TableHead>
          <TableRow>
            <TableCell>รหัส</TableCell>
            <TableCell>ชื่อโปรเจกต์</TableCell>
            <TableCell>รูปภาพ</TableCell>
            <TableCell align="center">การดำเนินการ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project) => (
            <TableRow
              key={project.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {project.id}
              </TableCell>
              <TableCell>{project.name}</TableCell>
              <TableCell>
                {/* --- แก้ไขตรงนี้: ใช้ combineImageUrl --- */}
                <Avatar alt={project.name} src={combineImageUrl(project.imageUrl)} variant="rounded" />
              </TableCell>
              <TableCell align="center">
                <IconButton aria-label="edit" color="primary" onClick={() => onEdit(project)}>
                  <EditIcon />
                </IconButton>
                <IconButton aria-label="delete" color="error" onClick={() => onDelete(project.id)}>
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