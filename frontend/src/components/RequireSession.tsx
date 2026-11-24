'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { Box, CircularProgress } from '@mui/material'

import { checkAuth } from '@/libs/api/auth'

export default function RequireSession({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (checkAuth()) {
      setReady(true)
    } else {
      setReady(false)
      const destination = encodeURIComponent(pathname + window.location.search)

      router.replace('/login?next=' + destination)
    }
  }, [pathname, router])

  if (ready) return children

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
      <CircularProgress aria-label='กำลังตรวจสอบสถานะการเข้าสู่ระบบ' />
    </Box>
  )
}
