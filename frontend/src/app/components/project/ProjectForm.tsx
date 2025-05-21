// src/components/project/ProjectForm.tsx
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import InputAdornment from '@mui/material/InputAdornment'; // เพิ่ม InputAdornment
import { Project } from '../../types';
import { combineImageUrl, API_BASE_URL } from '../../lib/utils';

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (project: Omit<Project, 'id'> | Project) => void;
  onCancel: () => void;
}

export default function ProjectForm({ initialData, onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [nameError, setNameError] = useState(false);
  const [nameHelperText, setNameHelperText] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>(''); // เพิ่ม state สำหรับชื่อไฟล์

  useEffect(() => {
    if (initialData?.imageUrl) {
      setImagePreviewUrl(combineImageUrl(initialData.imageUrl));
      setSelectedFile(null);
      setImageFileName(initialData.imageUrl.split('/').pop() || ''); // ดึงชื่อไฟล์จาก URL
    } else {
      setImagePreviewUrl(null);
      setSelectedFile(null);
      setImageFileName('');
    }
  }, [initialData]);


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      setNameError(true);
      setNameHelperText('ชื่อโปรเจกต์ห้ามว่างเปล่า');
      return;
    } else {
      setNameError(false);
      setNameHelperText('');
    }

    if (!initialData) {
        const newProjectData: Omit<Project, 'id'> = {
            name,
            imageFile: selectedFile || undefined,
            imageUrl: ''
        };
        onSubmit(newProjectData);
    } else {
        const updatedProjectData: Project = {
            ...initialData,
            name,
            imageFile: selectedFile || undefined,
            imageUrl: selectedFile ? '' : initialData.imageUrl
        };
        onSubmit(updatedProjectData);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      setSelectedFile(file);
      setImageFileName(file.name); // เก็บชื่อไฟล์ที่เลือก
      event.target.value = '';
    }
  };

  const handleDeleteImage = () => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setSelectedFile(null);
    setImageFileName(''); // ล้างชื่อไฟล์
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
      {!initialData && (
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
        onChange={(e) => {
          setName(e.target.value);
          if (nameError && e.target.value.trim()) {
            setNameError(false);
            setNameHelperText('');
          }
        }}
        required
        error={nameError}
        helperText={nameHelperText}
      />
      {/* === ส่วน Image Upload ที่ปรับปรุงใหม่ === */}
      <FormControl fullWidth sx={{ m: 1 }}>
        {/* ซ่อน Input จริงๆ */}
        <Input
          id="project-image-upload-button"
          type="file"
          inputProps={{ accept: 'image/*' }}
          onChange={handleImageUpload}
          sx={{ display: 'none' }}
        />
        <TextField
          label="รูปภาพโปรเจกต์"
          variant="outlined"
          fullWidth
          value={imageFileName} // แสดงชื่อไฟล์ที่เลือก
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <label htmlFor="project-image-upload-button">
                  <Button
                    variant="contained" // ใช้ contained เพื่อให้ปุ่มเด่นขึ้น
                    component="span"
                    startIcon={<AttachFileIcon />}
                    sx={{ ml: 1 }}
                  >
                    เลือกไฟล์
                  </Button>
                </label>
              </InputAdornment>
            ),
          }}
        />
        {imagePreviewUrl && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2, border: '1px solid #ccc', p: 1, borderRadius: '4px' }}>
            <Box sx={{ position: 'relative', mr: 1, mb: 1, border: '1px solid #eee', p: 0.5, borderRadius: '4px' }}>
              <img
                src={imagePreviewUrl}
                alt="Preview"
                style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '4px' }}
              />
              <IconButton
                aria-label="delete image"
                size="small"
                onClick={handleDeleteImage}
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  },
                }}
              >
                <DeleteIcon fontSize="small" color="error" />
              </IconButton>
            </Box>
          </Box>
        )}
      </FormControl>
      {/* ================================================= */}
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