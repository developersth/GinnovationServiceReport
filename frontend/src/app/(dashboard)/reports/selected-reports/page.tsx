// src/app/admin/reports/selected-reports/page.tsx
'use client'

import React, { useEffect, useState, useRef } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import { Box, Typography, CircularProgress, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import PrintIcon from '@mui/icons-material/Print'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import PrintableServiceReport from '@/views/report/PrintableServiceReport'
import { getServiceReportById, getProjectById, getProjects, getUsers } from '@/libs/api/data'
import type { ServiceReport, Project, User } from '@/types'
import { formatDate } from '@/utils'

// สร้าง type สำหรับ StaffRow ที่จะใช้งาน
interface ServiceStaffRow extends User {
  date?: string
  start?: string
  end?: string
  workingHours?: string
  travellingHours?: string
  charging?: string
}

export default function SelectedReportsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reportIdsParam = searchParams.get('ids')

  const [allReports, setAllReports] = useState<ServiceReport[]>([])
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!reportIdsParam) {
        setError('No report IDs provided.')
        setLoading(false)

        return
      }

      const ids = reportIdsParam.split(',')

      if (ids.length === 0) {
        setError('No report IDs provided.')
        setLoading(false)

        return
      }

      setLoading(true)
      setError(null)

      try {
        const fetchedReports: ServiceReport[] = []
        const fetchedProjectsMap = new Map<string, Project>()
        const projectsData = await getProjects()
        const usersData = await getUsers()

        if (projectsData) {
          setAllProjects(projectsData)
          projectsData.forEach(p => fetchedProjectsMap.set(p.id, p))
        }

        if (usersData) {
          setAllUsers(usersData)
        }

        for (const id of ids) {
          const reportData = await getServiceReportById(id)

          if (reportData) {
            fetchedReports.push(reportData)

            if (reportData.projectId && !fetchedProjectsMap.has(reportData.projectId)) {
              const projectData = await getProjectById(reportData.projectId)

              if (projectData) {
                fetchedProjectsMap.set(reportData.projectId, projectData)
              }
            }
          }
        }

        setAllReports(fetchedReports)

        if (fetchedReports.length > 0 && fetchedReports[0].projectId) {
          setSelectedProjectId(fetchedReports[0].projectId)
        } else if (projectsData.length > 0) {
          setSelectedProjectId(projectsData[0].id)
        }
      } catch (err) {
        console.error('[SelectedReportsPage] Failed to fetch reports or projects:', err)
        setError('Failed to load selected service reports.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [reportIdsParam])

  const handleBackClick = () => {
    router.back()
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant='h6' sx={{ ml: 2 }}>
          Loading Reports...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color='error' variant='h6'>
          {error}
        </Typography>
      </Box>
    )
  }

  if (allReports.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant='h6'>No service reports found for the selected IDs.</Typography>
      </Box>
    )
  }

  const projectForPrintableReport = allProjects.find(p => p.id === selectedProjectId)

  // เตรียมข้อมูล Staff สำหรับส่งไปที่ PrintableServiceReport
  const staffForPrintableReport: ServiceStaffRow[] = allReports.reduce<ServiceStaffRow[]>((acc, report) => {
    if (report.reportedBy && allUsers.length > 0) {
      const staffUser = allUsers.find(user => user.id === report.reportedBy)

      if (staffUser) {
        // หากต้องการข้อมูลอื่นๆ ของ staff เช่น วันที่, เวลาเข้า-ออก ก็สามารถเพิ่มได้ในส่วนนี้
        acc.push({
          ...staffUser,
          date: formatDate(report.reportDate)
        })
      }
    }

    return acc
  }, [])

  // Filter ให้เหลือเฉพาะข้อมูลที่ไม่ซ้ำกัน
  const uniqueStaff = staffForPrintableReport.filter(
    (staff, index, self) => index === self.findIndex(s => s.id === staff.id)
  )

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant='h5'>รายงาน Service Report ที่เลือก</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button variant='outlined' color='secondary' startIcon={<ArrowBackIcon />} onClick={handleBackClick}>
            ย้อนกลับ
          </Button>

          <FormControl sx={{ minWidth: 200 }} size='small'>
            <InputLabel id='project-select-label'>เลือกโปรเจกต์</InputLabel>
            <Select
              labelId='project-select-label'
              value={selectedProjectId}
              label='เลือกโปรเจกต์'
              onChange={e => setSelectedProjectId(e.target.value)}
            >
              {allProjects.map(project => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant='contained' color='primary' startIcon={<PrintIcon />} onClick={() => window.print()}>
            พิมพ์รายงาน
          </Button>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* ... โค้ดส่วนอื่นๆ ... */}
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          {' '}
          {/* เพิ่ม Box นี้ */}
          <div
            ref={reportRef}
            style={{ width: '210mm', minHeight: '297mm', padding: '10mm', backgroundColor: 'white' }}
          >
            {/* ส่งข้อมูล Staff ไปให้ PrintableServiceReport ด้วย */}
            <PrintableServiceReport
              reports={allReports}
              project={projectForPrintableReport || undefined}
              serviceStaff={uniqueStaff}
            />
          </div>
        </Box>
        {/* ... โค้ดส่วนอื่นๆ ... */}
      </Box>
    </Box>
  )
}
