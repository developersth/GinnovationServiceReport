// src/app/admin/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'
import { Typography, Box, CircularProgress, Alert, Grid, Paper, Card, CardContent, Avatar, Stack } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// --- Import MUI Icons ---
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

import { getServiceReports, getProjects } from '../../libs/api/data'
import type { ServiceReport, Project } from '../../types'

export default function DashboardPage() {
  const [serviceReports, setServiceReports] = useState<ServiceReport[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const theme = useTheme()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [reportsData, projectsData] = await Promise.all([getServiceReports(), getProjects()])

        setServiceReports(reportsData)
        setProjects(projectsData)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  function getReportsByProjectData(serviceReports: ServiceReport[], projects: Project[]) {
    const projectIdToName: Record<string, string> = {}

    projects.forEach(project => {
      projectIdToName[project.id] = project.name
    })
    const projectReportCounts: Record<string, number> = {}

    serviceReports.forEach(report => {
      if (report.projectId) {
        projectReportCounts[report.projectId] = (projectReportCounts[report.projectId] || 0) + 1
      }
    })

    return Object.entries(projectReportCounts).map(([projectId, count]) => ({
      name: projectIdToName[projectId] || 'Unknown',
      reports: count
    }))
  }

  function getReportsByMonthData(serviceReports: ServiceReport[]) {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
    const year = new Date().getFullYear()
    const monthlyCounts = Array(12).fill(0)

    serviceReports.forEach(report => {
      const date = new Date(report.reportDate)

      if (date.getFullYear() === year) {
        monthlyCounts[date.getMonth()]++
      }
    })

    return months.map((name, idx) => ({
      name,
      reports: monthlyCounts[idx]
    }))
  }

  function getAnnualReportCounts(serviceReports: ServiceReport[]) {
    const currentYear = new Date().getFullYear()
    const previousYear = currentYear - 1
    let currentYearCount = 0
    let previousYearCount = 0

    serviceReports.forEach(report => {
      const reportYear = new Date(report.reportDate).getFullYear()

      if (reportYear === currentYear) {
        currentYearCount++
      } else if (reportYear === previousYear) {
        previousYearCount++
      }
    })

    return {
      currentYear,
      previousYear,
      currentYearCount,
      previousYearCount
    }
  }

  // --- NEW: Function to prepare data for annual chart ---
  function getAnnualReportsChartData(serviceReports: ServiceReport[]) {
    const { currentYear, previousYear, currentYearCount, previousYearCount } = getAnnualReportCounts(serviceReports)

    return [
      { name: `ปี ${previousYear}`, reports: previousYearCount },
      { name: `ปี ${currentYear}`, reports: currentYearCount }
    ]
  }

  const reportsByProjectData = getReportsByProjectData(serviceReports, projects)
  const reportsByMonthData = getReportsByMonthData(serviceReports)
  const annualReportCounts = getAnnualReportCounts(serviceReports)
  const annualReportsChartData = getAnnualReportsChartData(serviceReports) // NEW: Data for annual chart

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant='h6' sx={{ ml: 2 }}>
          กำลังโหลดข้อมูล...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity='error'>ข้อผิดพลาด: {error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Typography variant='h4' component='h1' gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Dashboard
      </Typography>

      {/* Info Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card raised sx={{ p: 2 }}>
            <CardContent>
              <Stack direction='row' alignItems='center' spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48 }}>
                  <DescriptionOutlinedIcon sx={{ color: theme.palette.primary.contrastText }} />
                </Avatar>
                <Box>
                  <Typography variant='h5' component='p' sx={{ fontWeight: 'bold' }}>
                    {serviceReports.length}
                  </Typography>
                  <Typography variant='subtitle1' color='text.secondary'>
                    จำนวนรายงานทั้งหมด
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card raised sx={{ p: 2 }}>
            <CardContent>
              <Stack direction='row' alignItems='center' spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 48, height: 48 }}>
                  <AccessTimeIcon sx={{ color: theme.palette.secondary.contrastText }} />
                </Avatar>
                <Box>
                  <Typography variant='h5' component='p' sx={{ fontWeight: 'bold' }}>
                    {annualReportCounts.currentYearCount}
                  </Typography>
                  <Typography variant='subtitle1' color='text.secondary'>
                    รายงานปี {annualReportCounts.currentYear}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card raised sx={{ p: 2 }}>
            <CardContent>
              <Stack direction='row' alignItems='center' spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.info.main, width: 48, height: 48 }}>
                  <BusinessOutlinedIcon sx={{ color: theme.palette.info.contrastText }} />
                </Avatar>
                <Box>
                  <Typography variant='h5' component='p' sx={{ fontWeight: 'bold' }}>
                    {reportsByProjectData.length}
                  </Typography>
                  <Typography variant='subtitle1' color='text.secondary'>
                    จำนวนโครงการที่รับบริการ
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card raised sx={{ p: 2 }}>
            <CardContent>
              <Stack direction='row' alignItems='center' spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.success.main, width: 48, height: 48 }}>
                  <CheckCircleOutlineOutlinedIcon sx={{ color: theme.palette.success.contrastText }} />
                </Avatar>
                <Box>
                  <Typography variant='h5' component='p' sx={{ fontWeight: 'bold' }}>
                    อัปเดตแล้ว
                  </Typography>
                  <Typography variant='subtitle1' color='text.secondary'>
                    สถานะข้อมูลล่าสุด
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reports by Project Chart and Reports by Month Chart */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom sx={{ color: 'text.primary' }}>
              รายงานบริการตามโครงการ
            </Typography>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={reportsByProjectData} margin={{ top: 16, right: 16, bottom: 16, left: 0 }}>
                <CartesianGrid strokeDasharray='3 3' stroke={theme.palette.divider} vertical={false} />
                <XAxis
                  dataKey='name'
                  stroke={theme.palette.divider}
                  tick={{ fill: theme.palette.text.secondary }}
                  style={{ fontSize: 12 }}
                />
                <YAxis stroke={theme.palette.divider} tick={{ fill: theme.palette.text.secondary }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px'
                  }}
                  itemStyle={{ color: theme.palette.text.primary }}
                />
                <Legend wrapperStyle={{ color: theme.palette.text.primary }} />
                <Bar dataKey='reports' name='Reports' fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom sx={{ color: 'text.primary' }}>
              รายงานบริการรายเดือน (ปี {annualReportCounts.currentYear})
            </Typography>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={reportsByMonthData} margin={{ top: 16, right: 16, bottom: 16, left: 0 }}>
                <CartesianGrid strokeDasharray='3 3' stroke={theme.palette.divider} vertical={false} />
                <XAxis
                  dataKey='name'
                  stroke={theme.palette.divider}
                  tick={{ fill: theme.palette.text.secondary }}
                  style={{ fontSize: 12 }}
                />
                <YAxis stroke={theme.palette.divider} tick={{ fill: theme.palette.text.secondary }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px'
                  }}
                  itemStyle={{ color: theme.palette.text.primary }}
                />
                <Legend wrapperStyle={{ color: theme.palette.text.primary }} />
                <Bar dataKey='reports' name='Reports' fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* NEW: Annual Reports Chart */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom sx={{ color: 'text.primary' }}>
              รายงานประจำปี: เปรียบเทียบจำนวนรายงาน
            </Typography>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={annualReportsChartData} margin={{ top: 16, right: 16, bottom: 16, left: 0 }}>
                <CartesianGrid strokeDasharray='3 3' stroke={theme.palette.divider} vertical={false} />
                <XAxis
                  dataKey='name'
                  stroke={theme.palette.divider}
                  tick={{ fill: theme.palette.text.secondary }}
                  style={{ fontSize: 12 }}
                />
                <YAxis stroke={theme.palette.divider} tick={{ fill: theme.palette.text.secondary }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px'
                  }}
                  itemStyle={{ color: theme.palette.text.primary }}
                />
                <Legend wrapperStyle={{ color: theme.palette.text.primary }} />
                <Bar dataKey='reports' name='จำนวนรายงาน' fill={theme.palette.primary.dark} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
