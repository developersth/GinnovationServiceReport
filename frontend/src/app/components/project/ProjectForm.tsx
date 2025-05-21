// src/components/project/ProjectForm.tsx
'use client'; // Client Component

import * as React from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Project } from '../../types';

interface ProjectFormProps {
  initialData?: Project; // ใช้สำหรับแก้ไข: ถ้ามีค่าคือโหมดแก้ไข
  onSubmit: (project: Omit<Project, 'id'> | Project) => void; // Omit<Project, 'id'> สำหรับเพิ่ม, Project สำหรับแก้ไข
  onCancel: () => void;
}

export default function ProjectForm({ initialData, onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = React.useState(initialData?.name || '');
  const [imageUrl, setImageUrl] = React.useState(initialData?.imageUrl || '');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (initialData) {
      // Edit mode
      onSubmit({ ...initialData, name, imageUrl });
    } else {
      // Add mode
      onSubmit({ name, imageUrl });
    }
  };

  return (
    <Box
      component="form"
      sx={{ '& .MuiTextField-root': { m: 1, width: '100%' }, p: 2 }}
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        {initialData ? 'แก้ไขโปรเจกต์' : 'เพิ่มโปรเจกต์ใหม่'}
      </Typography>
      {!initialData && ( // ไม่แสดง ID ในโหมดเพิ่ม
        <TextField
          id="project-id"
          label="รหัสโปรเจกต์ (สร้างอัตโนมัติ)"
          defaultValue="สร้างอัตโนมัติ"
          InputProps={{
            readOnly: true,
          }}
          variant="filled"
          disabled
        />
      )}
      <TextField
        id="project-name"
        label="ชื่อโปรเจกต์"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <TextField
        id="project-image"
        label="URL รูปภาพ"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        required
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit" variant="contained" color="primary">
          {initialData ? 'บันทึกการแก้ไข' : 'เพิ่มโปรเจกต์'}
        </Button>
      </Box>
    </Box>
  );
}