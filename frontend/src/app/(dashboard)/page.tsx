'use client'

import { useCallback, useEffect, useState } from 'react'

import Link from 'next/link'

import { Alert, Box, Button, Card, CardContent, Skeleton, Stack, Typography } from '@mui/material'
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined'
import BusinessOutlined from '@mui/icons-material/BusinessOutlined'
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined'
import EventOutlined from '@mui/icons-material/EventOutlined'
import HistoryOutlined from '@mui/icons-material/HistoryOutlined'
import InsertChartOutlined from '@mui/icons-material/InsertChartOutlined'
import SpaceDashboardOutlined from '@mui/icons-material/SpaceDashboardOutlined'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { getProjects, getServiceReports } from '@/libs/api/data'
import type { Project, ServiceReport } from '@/types'

const timeZone = 'Asia/Bangkok'
const yearFormatter = new Intl.DateTimeFormat('en-GB', { year: 'numeric', timeZone })
const monthFormatter = new Intl.DateTimeFormat('en-GB', { month: 'numeric', timeZone })
const monthLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

type ChartPoint = { name: string; reports: number }

function ReportChart({ title, data, color }: { title: string; data: ChartPoint[]; color: string }) {
  return (
    <Card variant='outlined' sx={{ minWidth: 0 }}>
      <CardContent>
        <Typography component='h2' sx={{ fontSize: '1.125rem', fontWeight: 800, mb: 2 }}>{title}</Typography>
        <Box sx={{ width: '100%', height: 260, minWidth: 0 }}>
          <ResponsiveContainer width='100%' height='100%' minWidth={0}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -25, bottom: 10 }}>
              <CartesianGrid stroke='var(--mui-palette-divider)' vertical={false} />
              <XAxis
                dataKey='name'
                tick={{ fill: 'var(--mui-palette-text-secondary)', fontSize: 12 }}
                tickFormatter={name => (name.length > 16 ? name.slice(0, 15) + '…' : name)}
              />
              <YAxis allowDecimals={false} tick={{ fill: 'var(--mui-palette-text-secondary)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--mui-palette-background-paper)', borderRadius: 8 }} />
              <Bar dataKey='reports' name='จำนวนรายงาน' fill={color} radius={[4, 4, 0, 0]} maxBarSize={54} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<{ projects: Project[]; reports: ServiceReport[] } | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')

    try {
      const [projects, reports] = await Promise.all([getProjects(), getServiceReports()])

      setData({ projects, reports })
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'โหลดข้อมูลภาพรวมไม่ได้')
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const currentYear = Number(yearFormatter.format(new Date()))
  const monthly = monthLabels.map(name => ({ name, reports: 0 }))
  const annual = [currentYear - 1, currentYear].map(year => ({ name: String(year), reports: 0 }))
  const projectNames = new Map(data?.projects.map(project => [project.id, project.name]))
  const projectCounts = new Map<string, number>()

  for (const report of data?.reports ?? []) {
    projectCounts.set(report.projectId, (projectCounts.get(report.projectId) ?? 0) + 1)
    const date = new Date(report.reportDate)

    if (!Number.isFinite(date.valueOf())) continue
    const year = Number(yearFormatter.format(date))

    if (year === currentYear) monthly[Number(monthFormatter.format(date)) - 1].reports++
    if (year === currentYear || year === currentYear - 1) annual[year - currentYear + 1].reports++
  }

  const projectChart = [...projectCounts].map(([id, reports]) => ({ name: projectNames.get(id) ?? 'โครงการไม่พบ', reports }))

  const metrics = [
    { label: 'รายงานทั้งหมด', count: data?.reports.length, Icon: AssignmentOutlined, tone: 'primary' },
    { label: 'รายงานปี ' + currentYear, count: annual[1].reports, Icon: EventOutlined, tone: 'success' },
    { label: 'รายงานปี ' + (currentYear - 1), count: annual[0].reports, Icon: HistoryOutlined, tone: 'success' },
    { label: 'โครงการทั้งหมด', count: data?.projects.length, Icon: BusinessOutlined, tone: 'success' }
  ]

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent='space-between'
        gap={2}
        sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 2, color: '#fff', bgcolor: '#113b32', borderBottom: '4px solid #dc4447' }}
      >
        <Stack direction='row' alignItems='center' gap={{ xs: 1.5, md: 2 }}>
          <Box
            aria-hidden
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: { xs: 44, md: 60 },
              height: { xs: 44, md: 60 },
              flexShrink: 0,
              color: '#d5f1e5',
              bgcolor: 'rgba(213, 241, 229, 0.12)',
              border: '1px solid rgba(213, 241, 229, 0.24)',
              borderRadius: 1.5
            }}
          >
            <SpaceDashboardOutlined sx={{ fontSize: { xs: 24, md: 30 } }} />
          </Box>
          <Box>
            <Typography
              component='h1'
              sx={{ color: 'inherit', fontWeight: 800, fontSize: { xs: '1.55rem', md: '2.5rem' } }}
            >
              ภาพรวมงานบริการ
            </Typography>
            <Typography sx={{ color: '#cfe3da', mt: 0.5 }}>ติดตามจำนวนรายงานและโครงการที่ทีมดูแล</Typography>
          </Box>
        </Stack>
        <Button href='/reports' component={Link} variant='contained' startIcon={<DescriptionOutlined />} sx={{ flexShrink: 0 }}>
          เปิดรายงานบริการ
        </Button>
      </Stack>
      {error ? (
        <Alert severity='error' action={<Button color='inherit' onClick={load}>ลองใหม่</Button>}>{error}</Alert>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 2 }}>
          {metrics.map(({ label, count, Icon, tone }) => (
            <Card variant='outlined' key={label}>
              <CardContent>
                <Box
                  aria-hidden
                  sx={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 42,
                    height: 42,
                    borderRadius: 1.25,
                    bgcolor: tone + '.lighterOpacity',
                    color: tone + '.main'
                  }}
                >
                  <Icon fontSize='small' />
                </Box>
                <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>{label}</Typography>
                <Typography component='p' sx={{ fontSize: { xs: '1.65rem', md: '2.1rem' }, fontWeight: 800 }}>
                  {data ? count?.toLocaleString('th-TH') : <Skeleton width='3ch' />}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
      {data && data.reports.length === 0 && <Alert severity='info'>ยังไม่มีรายงานบริการ เริ่มเพิ่มรายงานได้จากหน้า Reports</Alert>}
      {data && data.reports.length > 0 && (
        <>
          <Stack direction='row' alignItems='center' gap={1}>
            <InsertChartOutlined color='success' aria-hidden />
            <Typography component='h2' sx={{ color: 'text.primary', fontSize: '1.4rem', fontWeight: 800 }}>
              สถิติรายงาน
            </Typography>
          </Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
            <ReportChart title={'รายงานรายเดือน · ' + currentYear} data={monthly} color='#c6292f' />
            <ReportChart title='รายงานตามโครงการ' data={projectChart} color='#14835d' />
            <ReportChart title='รายงานเทียบรายปี' data={annual} color='#14835d' />
          </Box>
        </>
      )}
    </Stack>
  )
}
