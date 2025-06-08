// src/app/admin/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'
import { Typography, Box, CircularProgress, Alert } from '@mui/material' // Removed Button
import { useTheme } from '@mui/material/styles' // Import useTheme

// --- Import MUI Icons ---
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined' // For reports
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined' // For projects
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined' // For status
// Removed LightModeIcon and DarkModeIcon as toggle button is removed

// No longer importing colorSchemes directly here, as useTheme provides the current palette.
// import colorSchemes from '../../@core/theme/colorSchemes' // This line might no longer be needed

import { getServiceReports, getProjects } from '../../libs/api/data'
import type { ServiceReport, Project } from '../../types'

export default function DashboardPage() {
  const [serviceReports, setServiceReports] = useState<ServiceReport[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use the useTheme hook to get the current theme object
  const theme = useTheme()

  // If you are using @mui/material-next or Joy UI for color schemes:
  // Use the palette mode from the theme object
  const currentThemeMode = theme.palette.mode // 'light' or 'dark'

  // Access the palette from the current theme object
  // theme.palette will automatically be the correct light or dark palette based on the active theme mode
  const currentPalette = theme.palette

  // Dynamically define themeColors based on currentPalette
  const themeColors = {
    // Main accent colors from MUI palette for bars
    primaryBar: currentPalette.primary.main,
    secondaryBar: currentPalette.success.main,

    // Dashboard structure colors
    pageBackground: currentPalette.background.default,
    cardBackground: currentPalette.background.paper,
    cardBorder: currentPalette.divider,

    // Adjust shadow based on the actual theme mode
    cardBoxShadow: currentThemeMode === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.05)' : '0 4px 12px rgba(0, 0, 0, 0.3)',
    chartBackground: currentPalette.background.paper,

    // Text colors
    textColorPrimary: currentPalette.text.primary,
    textColorSecondary: currentPalette.text.secondary,

    // Chart specific colors
    gridAndAxis: currentPalette.divider,
    axisLabelColor: currentPalette.text.secondary,
    tooltipBackground: currentPalette.background.paper,
    tooltipBorder: currentPalette.divider,
    tooltipTextColor: currentPalette.text.primary,
    legendTextColor: currentPalette.text.primary,

    // Icon background and foreground colors - using MUI palette where possible for dark mode compatibility
    // These will now correctly pull from the currentPalette (light or dark)
    iconBgGreen: currentPalette.success.lightOpacity,
    iconGreen: currentPalette.success.main,
    iconBgOrange: currentPalette.warning.lightOpacity,
    iconOrange: currentPalette.warning.main,
    iconBgPurple: currentPalette.primary.lighterOpacity,
    iconPurple: currentPalette.primary.main
  }

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

  const getChartYear = () => {
    if (serviceReports && serviceReports.length > 0) {
      const firstReportDate = serviceReports[0].reportDate

      if (firstReportDate) {
        return new Date(firstReportDate).getFullYear()
      }
    }

    return new Date().getFullYear()
  }

  // Helper function to group reports by project
  function getReportsByProjectData(serviceReports: ServiceReport[], projects: Project[]) {
    // Create a map of projectId to project name for quick lookup
    const projectIdToName: Record<string, string> = {}

    projects.forEach(project => {
      projectIdToName[project.id] = project.name
    })

    // Count reports per projectId
    const projectReportCounts: Record<string, number> = {}

    serviceReports.forEach(report => {
      if (report.projectId) {
        projectReportCounts[report.projectId] = (projectReportCounts[report.projectId] || 0) + 1
      }
    })

    // Return array for chart: { name, reports }
    return Object.entries(projectReportCounts).map(([projectId, count]) => ({
      name: projectIdToName[projectId] || 'Unknown',
      reports: count
    }))
  }

  const reportsByProjectData = getReportsByProjectData(serviceReports, projects)
  const reportsByMonthData = getReportsByMonthData(serviceReports)
  const chartYear = getChartYear()

  // Helper function to group reports by month
  function getReportsByMonthData(serviceReports: ServiceReport[]) {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

    const year = serviceReports[0]?.reportDate
      ? new Date(serviceReports[0].reportDate).getFullYear()
      : new Date().getFullYear()

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

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          backgroundColor: themeColors.pageBackground
        }}
      >
        <CircularProgress sx={{ color: themeColors.textColorPrimary }} />
        <Typography variant='h6' sx={{ ml: 2, color: themeColors.textColorPrimary }}>
          กำลังโหลดข้อมูล...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 4, backgroundColor: themeColors.pageBackground }}>
        <Alert severity='error'>ข้อผิดพลาด: {error}</Alert>
      </Box>
    )
  }

  return (
    <div
      className='p-4'
      style={{
        backgroundColor: themeColors.pageBackground,
        minHeight: '100vh',
        transition: 'background-color 0.3s ease-in-out'
      }}
    >
      {/* Removed the theme toggle button */}

      {/* Info Cards */}
      <section className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        {/* Card 1: Total Service Reports */}
        <div
          className='p-4 rounded-lg'
          style={{
            backgroundColor: themeColors.cardBackground,
            border: `1px solid ${themeColors.cardBorder}`,
            boxShadow: themeColors.cardBoxShadow,
            transition: 'background-color 0.3s ease-in-out, border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: themeColors.iconBgPurple,
                transition: 'background-color 0.3s ease-in-out'
              }}
            >
              <DescriptionOutlinedIcon sx={{ color: themeColors.iconPurple, fontSize: '1.25rem' }} />
            </Box>
            <p
              className='text-xl'
              style={{ color: themeColors.textColorSecondary, transition: 'color 0.3s ease-in-out' }}
            >
              จำนวนรายงานบริการทั้งหมด
            </p>
          </Box>
          <p
            className='text-2xl font-bold'
            style={{ color: themeColors.textColorPrimary, transition: 'color 0.3s ease-in-out' }}
          >
            {serviceReports.length}
          </p>
        </div>

        {/* Card 2: Unique Projects Serviced */}
        <div
          className='p-4 rounded-lg'
          style={{
            backgroundColor: themeColors.cardBackground,
            border: `1px solid ${themeColors.cardBorder}`,
            boxShadow: themeColors.cardBoxShadow,
            transition: 'background-color 0.3s ease-in-out, border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: themeColors.iconBgOrange,
                transition: 'background-color 0.3s ease-in-out'
              }}
            >
              <BusinessOutlinedIcon sx={{ color: themeColors.iconOrange, fontSize: '1.25rem' }} />
            </Box>
            <p
              className='text-xl'
              style={{ color: themeColors.textColorSecondary, transition: 'color 0.3s ease-in-out' }}
            >
              จำนวนโครงการที่รับบริการ (ไม่ซ้ำกัน)
            </p>
          </Box>
          <p
            className='text-2xl font-bold'
            style={{ color: themeColors.textColorPrimary, transition: 'color 0.3s ease-in-out' }}
          >
            {reportsByProjectData.length}
          </p>
        </div>

        {/* Card 3: Latest Status */}
        <div
          className='p-4 rounded-lg'
          style={{
            backgroundColor: themeColors.cardBackground,
            border: `1px solid ${themeColors.cardBorder}`,
            boxShadow: themeColors.cardBoxShadow,
            transition: 'background-color 0.3s ease-in-out, border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: themeColors.iconBgGreen,
                transition: 'background-color 0.3s ease-in-out'
              }}
            >
              <CheckCircleOutlineOutlinedIcon sx={{ color: themeColors.iconGreen, fontSize: '1.25rem' }} />
            </Box>
            <p
              className='text-xl'
              style={{ color: themeColors.textColorSecondary, transition: 'color 0.3s ease-in-out' }}
            >
              สถานะล่าสุด
            </p>
          </Box>
          <p
            className='text-2xl font-bold'
            style={{ color: themeColors.textColorPrimary, transition: 'color 0.3s ease-in-out' }}
          >
            อัปเดตแล้ว
          </p>
        </div>
      </section>

      {/* Reports by Project Chart */}
      <section
        className='p-4 rounded-lg mb-6'
        style={{
          backgroundColor: themeColors.chartBackground,
          border: `1px solid ${themeColors.cardBorder}`,
          boxShadow: themeColors.cardBoxShadow,
          transition: 'background-color 0.3s ease-in-out, border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
        }}
      >
        <h2
          className='text-lg font-semibold mb-4'
          style={{ color: themeColors.textColorPrimary, transition: 'color 0.3s ease-in-out' }}
        >
          รายงานบริการตามโครงการ
        </h2>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={reportsByProjectData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray='3 3' stroke={themeColors.gridAndAxis} vertical={false} />
            <XAxis dataKey='name' stroke={themeColors.gridAndAxis} tick={{ fill: themeColors.axisLabelColor }} />
            <YAxis stroke={themeColors.gridAndAxis} tick={{ fill: themeColors.axisLabelColor }} />
            <Tooltip
              contentStyle={{
                background: themeColors.tooltipBackground,
                border: `1px solid ${themeColors.tooltipBorder}`,
                color: themeColors.tooltipTextColor,
                borderRadius: '8px',
                boxShadow: currentThemeMode === 'light' ? '0 2px 10px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.5)',
                transition:
                  'background-color 0.3s ease-in-out, border-color 0.3s ease-in-out, color 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
              }}
              itemStyle={{ color: themeColors.tooltipTextColor }}
            />
            <Legend wrapperStyle={{ color: themeColors.legendTextColor, transition: 'color 0.3s ease-in-out' }} />
            <Bar dataKey='reports' name='Reports' fill={themeColors.primaryBar} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Reports by Month Chart */}
      <section
        className='p-4 rounded-lg'
        style={{
          backgroundColor: themeColors.chartBackground,
          border: `1px solid ${themeColors.cardBorder}`,
          boxShadow: themeColors.cardBoxShadow,
          transition: 'background-color 0.3s ease-in-out, border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
        }}
      >
        <h2
          className='text-lg font-semibold mb-4'
          style={{ color: themeColors.textColorPrimary, transition: 'color 0.3s ease-in-out' }}
        >
          รายงานบริการรายเดือน (ปี {chartYear})
        </h2>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={reportsByMonthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray='3 3' stroke={themeColors.gridAndAxis} vertical={false} />
            <XAxis dataKey='name' stroke={themeColors.gridAndAxis} tick={{ fill: themeColors.axisLabelColor }} />
            <YAxis stroke={themeColors.gridAndAxis} tick={{ fill: themeColors.axisLabelColor }} />
            <Tooltip
              contentStyle={{
                background: themeColors.tooltipBackground,
                border: `1px solid ${themeColors.tooltipBorder}`,
                color: themeColors.tooltipTextColor,
                borderRadius: '8px',
                boxShadow: currentThemeMode === 'light' ? '0 2px 10px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.5)',
                transition:
                  'background-color 0.3s ease-in-out, border-color 0.3s ease-in-out, color 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
              }}
              itemStyle={{ color: themeColors.tooltipTextColor }}
            />
            <Legend wrapperStyle={{ color: themeColors.legendTextColor, transition: 'color 0.3s ease-in-out' }} />
            <Bar dataKey='reports' name='Reports' fill={themeColors.secondaryBar} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  )
}
