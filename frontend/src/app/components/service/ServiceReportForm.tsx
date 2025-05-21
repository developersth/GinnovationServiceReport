// src/components/service/ServiceReportForm.tsx
'use client';

import * as React from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { ServiceReport, Project } from '../../types';
import { getProjects } from '../../lib/data';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import Input from '@mui/material/Input';
import AttachFileIcon from '@mui/icons-material/AttachFile'; // เพิ่มไอคอนสำหรับปุ่มอัปโหลด
import IconButton from '@mui/material/IconButton'; // เพิ่ม IconButton
import DeleteIcon from '@mui/icons-material/Delete'; // เพิ่มไอคอนลบสำหรับรูปภาพ Preview

interface ServiceReportFormProps {
  initialData?: ServiceReport;
  onSubmit: (report: Omit<ServiceReport, 'id'> | ServiceReport) => void;
  onCancel: () => void;
}

const channels = ['โทรศัพท์', 'อีเมล', 'Line', 'อื่นๆ'];
const statuses = ['open', 'in progress', 'resolved', 'closed'];

export default function ServiceReportForm({ initialData, onSubmit, onCancel }: ServiceReportFormProps) {
  const [projectId, setProjectId] = React.useState(initialData?.projectId || '');
  const [reporter, setReporter] = React.useState(initialData?.reporter || '');
  const [complain, setComplain] = React.useState(initialData?.complain || '');
  const [causesOfFailure, setCausesOfFailure] = React.useState(initialData?.causesOfFailure || '');
  const [actionTaken, setActionTaken] = React.useState(initialData?.actionTaken || '');
  const [channel, setChannel] = React.useState(initialData?.channel || channels[0]);
  // เปลี่ยน imageUrls ให้เป็น Array ของ Object { url: string, file: File | null }
  // เพื่อเก็บไฟล์ต้นฉบับไว้สำหรับการอัปโหลดจริง (ถ้ามี)
  // สำหรับ mock data, เราจะเก็บแค่ url ชั่วคราว
  const [imagePreviews, setImagePreviews] = React.useState<{ url: string; id: string }[]>(
    initialData?.imageUrls.map(url => ({ url, id: url })) || [] // ใช้ URL เดิมเป็น ID สำหรับรูปภาพที่มีอยู่แล้ว
  );
  const [reportDate, setReportDate] = React.useState<Dayjs | null>(initialData ? dayjs(initialData.reportDate) : dayjs());
  const [status, setStatus] = React.useState<ServiceReport['status']>(initialData?.status || 'open');
  const [projects, setProjects] = React.useState<Project[]>([]);

  React.useEffect(() => {
    const fetchProjects = async () => {
      const data = await getProjects();
      setProjects(data);
    };
    fetchProjects();
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // ใน Production: คุณจะต้องอัปโหลดไฟล์ที่อยู่ใน imagePreviews.file ไปยัง Server ก่อน
    // และเก็บ URL ที่ได้จาก Server มาใส่ใน imageUrls แทน
    // สำหรับ Mock Data: เราจะใช้ URL ที่สร้างจาก createObjectURL เป็น imageUrls ไปก่อน
    const finalImageUrls = imagePreviews.map(preview => preview.url);

    const reportData = {
      projectId,
      reporter,
      complain,
      causesOfFailure,
      actionTaken,
      channel,
      imageUrls: finalImageUrls, // ใช้ URL ที่ได้จากการ preview หรือจาก server
      reportDate: reportDate ? reportDate.format('YYYY-MM-DD') : '',
      status,
    };
    onSubmit(initialData ? { ...initialData, ...reportData } : reportData);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPreviews: { url: string; id: string }[] = [];
      Array.from(files).forEach((file) => {
        const url = URL.createObjectURL(file);
        newPreviews.push({ url, id: file.name + Date.now() }); // ใช้ชื่อไฟล์ + timestamp เป็น ID ชั่วคราว
      });
      setImagePreviews((prev) => [...prev, ...newPreviews]);
      // Clear input field to allow re-uploading the same file if needed
      event.target.value = '';
    }
  };

  const handleDeleteImage = (idToDelete: string) => {
    setImagePreviews((prev) => prev.filter((img) => img.id !== idToDelete));
  };


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { m: 1, width: '100%' }, p: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {initialData ? 'แก้ไข Service Report' : 'เพิ่ม Service Report'}
        </Typography>
        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel id="project-id-label">โปรเจกต์</InputLabel>
          <Select
            labelId="project-id-label"
            id="project-id"
            value={projectId}
            label="โปรเจกต์"
            onChange={(e) => setProjectId(e.target.value)}
            required
          >
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField id="reporter" label="ผู้แจ้ง" value={reporter} onChange={(e) => setReporter(e.target.value)} required />
        <TextField
          id="complain"
          label="Complain"
          value={complain}
          onChange={(e) => setComplain(e.target.value)}
          required
          multiline
          rows={4}
        />
        <TextField
          id="causesOfFailure"
          label="สาเหตุของปัญหา"
          value={causesOfFailure}
          onChange={(e) => setCausesOfFailure(e.target.value)}
          multiline
          rows={4}
        />
        <TextField
          id="actionTaken"
          label="การแก้ไข/ดำเนินการ"
          value={actionTaken}
          onChange={(e) => setActionTaken(e.target.value)}
          multiline
          rows={4}
        />
        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel id="channel-label">ช่องทางการแจ้ง</InputLabel>
          <Select
            labelId="channel-label"
            id="channel"
            value={channel}
            label="ช่องทางการแจ้ง"
            onChange={(e) => setChannel(e.target.value)}
            required
          >
            {channels.map((ch) => (
              <MenuItem key={ch} value={ch}>
                {ch}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* === ส่วน Image Upload และ Preview ที่ปรับปรุง === */}
        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel htmlFor="image-upload-button" shrink={true}>
            รูปภาพ (หลายภาพ)
          </InputLabel>
          <Input
            id="image-upload-button"
            type="file"
            inputProps={{ multiple: true, accept: 'image/*' }}
            onChange={handleImageUpload}
            sx={{ display: 'none' }} // ซ่อน input จริง
          />
          <label htmlFor="image-upload-button">
            <Button
              variant="outlined"
              component="span" // สำคัญ: ทำให้ Button behave เหมือน span เพื่อให้ label ทำงาน
              startIcon={<AttachFileIcon />}
            >
              เลือกรูปภาพ
            </Button>
          </label>
          {imagePreviews.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2, border: '1px solid #ccc', p: 1, borderRadius: '4px' }}>
              {imagePreviews.map((preview) => (
                <Box key={preview.id} sx={{ position: 'relative', mr: 1, mb: 1, border: '1px solid #eee', p: 0.5, borderRadius: '4px' }}>
                  <img
                    src={preview.url}
                    alt="Preview"
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <IconButton
                    aria-label="delete image"
                    size="small"
                    onClick={() => handleDeleteImage(preview.id)}
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
              ))}
            </Box>
          )}
        </FormControl>
        {/* ================================================= */}
        <FormControl fullWidth sx={{ m: 1 }}>
          <DatePicker
            label="วันที่แจ้ง"
            value={reportDate}
            onChange={(newValue) => setReportDate(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
              },
            }}
          />
        </FormControl>
        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel id="status-label">สถานะ</InputLabel>
          <Select
            labelId="status-label"
            id="status"
            value={status}
            label="สถานะ"
            onChange={(e) => setStatus(e.target.value as ServiceReport['status'])}
            required
          >
            {statuses.map((st) => (
              <MenuItem key={st} value={st}>
                {st}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button variant="outlined" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {initialData ? 'บันทึกการแก้ไข' : 'เพิ่ม Service Report'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}