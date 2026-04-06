// src/components/report/ServiceReportDetail.tsx
import React, { useState } from 'react'

import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  Grid,
  ListItem,
  ListItemText,
  ImageList,
  ImageListItem,
  Switch,
  FormControlLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton
} from '@mui/material'

import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'

import type { ServiceReport, Project, StaffWorkingTime } from '../../types' // Assuming types are here
import { combineImageUrl, formatDate } from '../../utils' // Re-use utilities

interface ServiceReportDetailProps {
  report: ServiceReport
  project?: Project // Project data is passed directly from the parent fetching component
}

const ServiceReportDetail: React.FC<ServiceReportDetailProps> = ({ report, project }) => {
  const [isEditMode, setIsEditMode] = useState(false)

  const [staffWorkingTimes, setStaffWorkingTimes] = useState<StaffWorkingTime[]>(
    (report?.staffWorkingTime && report.staffWorkingTime.length > 0) ? report.staffWorkingTime : []
  )

  const [editingTime, setEditingTime] = useState<StaffWorkingTime | null>(null)

  if (!report) {
    return <Typography>No service report data available.</Typography>
  }

  // The 'project' prop should contain the full Project object if available.
  // We rely on the parent component (e.g., service-report-id-page.tsx) to fetch and pass it.
  const currentProject = project

  const handleAddStaffTime = () => {
    const newTime: StaffWorkingTime = {
      id: Date.now().toString(),
      engineerName: '',
      workingDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      workingHours: 8,
      travellingHours: 0,
      description: '',
      isCharging: false
    }

    setStaffWorkingTimes([...staffWorkingTimes, newTime])
    setEditingTime(newTime)
  }

  const handleEditStaffTime = (time: StaffWorkingTime) => {
    setEditingTime(time)
  }

  const handleDeleteStaffTime = (id: string) => {
    setStaffWorkingTimes(staffWorkingTimes.filter(time => time.id !== id))
  }

  const handleSaveStaffTime = (updatedTime: StaffWorkingTime) => {
    setStaffWorkingTimes(staffWorkingTimes.map(time =>
      time.id === updatedTime.id ? { ...updatedTime, isChanged: true } : time
    ))
    setEditingTime(null)
  }

  const handleCancelEdit = () => {
    setEditingTime(null)
  }

  return (
    <Paper sx={{ p: 4, my: 4 }}>
      {/* Header Section: Project Info, Report Date, Reporter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Use currentProject?.imageUrl instead of currentProject?.logo */}
          {currentProject?.imageUrl && (
            <img
              src={combineImageUrl(currentProject.imageUrl)}
              alt={currentProject.name}
              style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: '8px' }}
            />
          )}
          <Box>
            <Typography variant='h5' component='h2' gutterBottom>
              {/* Display Project Name. Removed 'code' as it's not in Project model. */}
              {currentProject ? `Project: ${currentProject.name}` : 'Project Not Found'}
            </Typography>
            <Typography variant='subtitle1' color='text.secondary'>
              Service Report
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant='body1'>**Report Date:** {formatDate(report.reportDate)}</Typography>
          <Typography variant='body1'>
            **Reporter:** {report.reportedBy} {/* Using 'reportedBy' as per updated type */}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Detail Section: Complain, CausesOfFailure, Action Taken, Channel */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant='h6' gutterBottom>
            Problem Details
          </Typography>
          <List dense>
            <ListItem disablePadding>
              <ListItemText
                primary={<Typography variant='body1'>**Complain:**</Typography>}
                secondary={<Typography variant='body1'>{report.complain}</Typography>}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText
                primary={<Typography variant='body1'>**Causes of Failure:**</Typography>}
                secondary={<Typography variant='body1'>{report.causesOfFailure}</Typography>}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText
                primary={<Typography variant='body1'>**Action Taken:**</Typography>}
                secondary={<Typography variant='body1'>{report.actionTaken}</Typography>}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText
                primary={<Typography variant='body1'>**Channel:**</Typography>}
                secondary={<Typography variant='body1'>{report.channel}</Typography>}
              />
            </ListItem>
          </List>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Images Section */}
      <Box>
        <Typography variant='h6' gutterBottom>
          Attached Images
        </Typography>
        {/* Use report.imagePaths instead of report.imageUrls */}
        {report.imagePaths && report.imagePaths.length > 0 ? (
          <ImageList sx={{ width: '100%', height: 'auto', mt: 2 }} cols={3} rowHeight={164}>
            {report.imagePaths.map(
              (item, index) =>
                typeof item === 'string' && (
                  <ImageListItem key={index}>
                    <img
                      srcSet={`${combineImageUrl(item)}?w=164&h=164&fit=crop&auto=format 1x,
                             ${combineImageUrl(item)}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                      src={`${combineImageUrl(item)}?w=164&h=164&fit=crop&auto=format`}
                      alt={`Service Report Image ${index + 1}`}
                      loading='lazy'
                      style={{ borderRadius: '8px' }}
                    />
                  </ImageListItem>
                )
            )}
          </ImageList>
        ) : (
          <Typography variant='body2' color='text.secondary'>
            No images attached.
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Staff Working Times Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant='h6' gutterBottom>
            Staff Working Times
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isEditMode}
                  onChange={(e) => setIsEditMode(e.target.checked)}
                  color="primary"
                />
              }
              label="แก้ไขข้อมูล"
            />
            {isEditMode && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddStaffTime}
                size="small"
              >
                เพิ่มข้อมูล
              </Button>
            )}
          </Box>
        </Box>

        {staffWorkingTimes.length > 0 ? (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ชื่อช่าง</TableCell>
                  <TableCell>วันที่</TableCell>
                  <TableCell>เวลาเริ่ม</TableCell>
                  <TableCell>เวลาสิ้นสุด</TableCell>
                  <TableCell>ชั่วโมงทำงาน</TableCell>
                  <TableCell>ชั่วโมงเดินทาง</TableCell>
                  <TableCell>คำอธิบาย</TableCell>
                  {isEditMode && <TableCell>การดำเนินการ</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {staffWorkingTimes.map((time) => (
                  <TableRow key={time.id}>
                    <TableCell>
                      {editingTime?.id === time.id ? (
                        <TextField
                          size="small"
                          value={editingTime.engineerName}
                          onChange={(e) => setEditingTime({ ...editingTime, engineerName: e.target.value })}
                        />
                      ) : (
                        time.engineerName
                      )}
                    </TableCell>
                    <TableCell>
                      {editingTime?.id === time.id ? (
                        <TextField
                          size="small"
                          type="date"
                          value={editingTime.workingDate}
                          onChange={(e) => setEditingTime({ ...editingTime, workingDate: e.target.value })}
                        />
                      ) : (
                        formatDate(time.workingDate) // Format date for display
                      )}
                    </TableCell>
                    <TableCell>
                      {editingTime?.id === time.id ? (
                        <TextField
                          size="small"
                          type="time"
                          value={editingTime.startTime}
                          onChange={(e) => setEditingTime({ ...editingTime, startTime: e.target.value })}
                        />
                      ) : (
                        time.startTime
                      )}
                    </TableCell>
                    <TableCell>
                      {editingTime?.id === time.id ? (
                        <TextField
                          size="small"
                          type="time"
                          value={editingTime.endTime}
                          onChange={(e) => setEditingTime({ ...editingTime, endTime: e.target.value })}
                        />
                      ) : (
                        time.endTime
                      )}
                    </TableCell>
                    <TableCell>{time.workingHours}</TableCell>
                    <TableCell>{time.travellingHours}</TableCell>
                    <TableCell>
                      {editingTime?.id === time.id ? (
                        <TextField
                          size="small"
                          multiline
                          rows={2}
                          value={editingTime.description}
                          onChange={(e) => setEditingTime({ ...editingTime, description: e.target.value })}
                        />
                      ) : (
                        time.description
                      )}
                    </TableCell>
                    {isEditMode && (
                      <TableCell>
                        {editingTime?.id === time.id ? (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" variant="contained" onClick={() => handleSaveStaffTime(editingTime)}>
                              บันทึก
                            </Button>
                            <Button size="small" onClick={handleCancelEdit}>
                              ยกเลิก
                            </Button>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" onClick={() => handleEditStaffTime(time)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteStaffTime(time.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant='body2' color='text.secondary'>
            ไม่มีข้อมูลเวลาทำงานของพนักงาน
          </Typography>
        )}
      </Box>
    </Paper>
  )
}

export default ServiceReportDetail
