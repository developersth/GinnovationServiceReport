// src/components/project/ProjectForm.tsx
'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'

import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel' // Ensure this is imported
import FormControl from '@mui/material/FormControl' // Ensure this is imported
import Select from '@mui/material/Select' // NEW: Import Select
import MenuItem from '@mui/material/MenuItem' // NEW: Import MenuItem
import AttachFileIcon from '@mui/icons-material/AttachFile'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import InputAdornment from '@mui/material/InputAdornment'

import type { Project } from '../../types'
import { combineImageUrl } from '../../utils'

interface ProjectFormProps {
  initialData?: Project
  onSubmit: (project: Omit<Project, 'id'> | Project) => void
  onCancel: () => void
}

export default function ProjectForm({ initialData, onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [nameError, setNameError] = useState(false)
  const [nameHelperText, setNameHelperText] = useState('')

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [imageFileName, setImageFileName] = useState<string>('')

  const [customerName, setCustomerName] = useState(initialData?.customerName || '')

  const [customerAddress, setCustomerAddress] = useState(initialData?.customerAddress || '')

  const [contactPerson, setContactPerson] = useState(initialData?.contactPerson || '')

  const [tel, setTel] = useState(initialData?.tel || '')
  const [serviceUnder, setServiceUnder] = useState(initialData?.serviceUnder || '')

  useEffect(() => {
    if (initialData?.imageUrl) {
      setImagePreviewUrl(combineImageUrl(initialData.imageUrl))
      setSelectedFile(null)
      setImageFileName(initialData.imageUrl.split('/').pop() || '')
    } else {
      setImagePreviewUrl(null)
      setSelectedFile(null)
      setImageFileName('')
    }

    if (initialData?.serviceUnder) {
      setServiceUnder(initialData.serviceUnder)
    }
  }, [initialData])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!name.trim()) {
      setNameError(true)
      setNameHelperText('ชื่อโปรเจกต์ห้ามว่างเปล่า')

      return
    } else {
      setNameError(false)
      setNameHelperText('')
    }

    if (!initialData) {
      const newProjectData: Omit<Project, 'id'> = {
        name,
        imageFile: selectedFile || undefined,
        imageUrl: '',
        customerName,
        customerAddress,
        contactPerson,
        tel,
        serviceUnder
      }

      onSubmit(newProjectData)
    } else {
      const updatedProjectData: Project = {
        ...initialData,
        name,
        imageFile: selectedFile || undefined,
        imageUrl: selectedFile ? '' : initialData.imageUrl,
        customerName,
        customerAddress,
        contactPerson,
        tel,
        serviceUnder
      }

      onSubmit(updatedProjectData)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      const url = URL.createObjectURL(file)

      setImagePreviewUrl(url)
      setSelectedFile(file)
      setImageFileName(file.name)
      event.target.value = ''
    }
  }

  const handleDeleteImage = () => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl)
    }

    setImagePreviewUrl(null)
    setSelectedFile(null)
    setImageFileName('')
  }

  // Define the options for the Service Under combobox
  const serviceUnderOptions = [
    'Under warranty',
    'Out of warranty',
    'Contract',
    'Sales support',
    'Commissioning',
    'Project'
  ]

  return (
    <Box
      component='form'
      sx={{ '& .MuiTextField-root': { m: 1, width: '100%' }, p: 2 }}
      noValidate
      autoComplete='off'
      onSubmit={handleSubmit}
    >
      <Typography variant='h6' component='h2' gutterBottom>
        {initialData ? 'แก้ไขโปรเจกต์' : 'เพิ่มโปรเจกต์ใหม่'}
      </Typography>
      {!initialData && (
        <TextField
          id='project-id'
          label='รหัสโปรเจกต์ (สร้างอัตโนมัติ)'
          defaultValue='สร้างอัตโนมัติ'
          InputProps={{
            readOnly: true
          }}
          variant='filled'
          disabled
        />
      )}
      <TextField
        id='project-name'
        label='ชื่อโปรเจกต์'
        value={name}
        onChange={e => {
          setName(e.target.value)

          if (nameError && e.target.value.trim()) {
            setNameError(false)
            setNameHelperText('')
          }
        }}
        required
        error={nameError}
        helperText={nameHelperText}
      />
      <TextField label='ชื่อลูกค้า' value={customerName} onChange={e => setCustomerName(e.target.value)} required />
      <TextField
        label='ที่อยู่ลูกค้า'
        value={customerAddress}
        onChange={e => setCustomerAddress(e.target.value)}
        multiline
        rows={2}
      />
      <TextField label='ผู้ติดต่อ' value={contactPerson} onChange={e => setContactPerson(e.target.value)} />
      <TextField label='เบอร์โทร' value={tel} onChange={e => setTel(e.target.value)} />

      {/* NEW: Service Under Combobox (Select) */}
      <FormControl fullWidth sx={{ m: 1 }}>
        <InputLabel id='service-under-label'>Service Under</InputLabel>
        <Select
          labelId='service-under-label'
          id='service-under-select'
          value={serviceUnder}
          label='Service Under'
          onChange={e => setServiceUnder(e.target.value as string)}
        >
          {/* Optional: Add an empty option for "None selected" or if it's not required */}
          <MenuItem value=''>
            <em>None</em>
          </MenuItem>
          {serviceUnderOptions.map(option => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* === ส่วน Image Upload === */}
      <FormControl fullWidth sx={{ m: 1 }}>
        <Input
          id='project-image-upload-button'
          type='file'
          inputProps={{ accept: 'image/*' }}
          onChange={handleImageUpload}
          sx={{ display: 'none' }}
        />
        <TextField
          label='รูปภาพโปรเจกต์'
          variant='outlined'
          fullWidth
          value={imageFileName}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position='end'>
                <label htmlFor='project-image-upload-button'>
                  <Button variant='contained' component='span' startIcon={<AttachFileIcon />} sx={{ ml: 1 }}>
                    เลือกไฟล์
                  </Button>
                </label>
              </InputAdornment>
            )
          }}
        />
        {imagePreviewUrl && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              mt: 2,
              border: '1px solid #ccc',
              p: 1,
              borderRadius: '4px'
            }}
          >
            <Box
              sx={{
                position: 'relative',
                mr: 1,
                mb: 1,
                border: '1px solid #eee',
                p: 0.5,
                borderRadius: '4px'
              }}
            >
              <img
                src={imagePreviewUrl}
                alt='Preview'
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
              />
              <IconButton
                aria-label='delete image'
                size='small'
                onClick={handleDeleteImage}
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)'
                  }
                }}
              >
                <DeleteIcon fontSize='small' color='error' />
              </IconButton>
            </Box>
          </Box>
        )}
      </FormControl>
      {/* ================================================= */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
        <Button variant='outlined' onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type='submit' variant='contained' color='primary'>
          {initialData ? 'บันทึกการแก้ไข' : 'เพิ่มโปรเจกต์'}
        </Button>
      </Box>
    </Box>
  )
}
