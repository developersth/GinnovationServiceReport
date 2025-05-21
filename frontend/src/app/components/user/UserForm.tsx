// src/components/user/UserForm.tsx
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
import { User } from '../../types';

interface UserFormProps {
  initialData?: User; // ใช้สำหรับแก้ไข: ถ้ามีค่าคือโหมดแก้ไข
  onSubmit: (user: Omit<User, 'id'> | User) => void;
  onCancel: () => void;
}

export default function UserForm({ initialData, onSubmit, onCancel }: UserFormProps) {
  const [name, setName] = React.useState(initialData?.name || '');
  const [email, setEmail] = React.useState(initialData?.email || '');
  const [role, setRole] = React.useState<User['role']>(initialData?.role || 'viewer'); // Default role

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (initialData) {
      // Edit mode
      onSubmit({ ...initialData, name, email, role });
    } else {
      // Add mode
      onSubmit({ name, email, role });
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
        {initialData ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
      </Typography>
      {!initialData && (
        <TextField
          id="user-id"
          label="รหัสผู้ใช้งาน (สร้างอัตโนมัติ)"
          defaultValue="สร้างอัตโนมัติ"
          InputProps={{
            readOnly: true,
          }}
          variant="filled"
          disabled
        />
      )}
      <TextField
        id="user-name"
        label="ชื่อผู้ใช้งาน"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <TextField
        id="user-email"
        label="อีเมล"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <FormControl fullWidth sx={{ m: 1 }}>
        <InputLabel id="user-role-label">บทบาท</InputLabel>
        <Select
          labelId="user-role-label"
          id="user-role"
          value={role}
          label="บทบาท"
          onChange={(e) => setRole(e.target.value as User['role'])}
        >
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="editor">Editor</MenuItem>
          <MenuItem value="viewer">Viewer</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit" variant="contained" color="primary">
          {initialData ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้งาน'}
        </Button>
      </Box>
    </Box>
  );
}