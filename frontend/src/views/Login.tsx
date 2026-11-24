'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'

import { useRouter } from 'next/navigation'

import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import LockOpenOutlined from '@mui/icons-material/LockOpenOutlined'
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined'

import Logo from '@components/layout/shared/Logo'
import { login } from '@/libs/api/auth'

export default function Login() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')

    try {
      await login(username, password)
      const requestedPath = new URLSearchParams(window.location.search).get('next')
      const target = requestedPath?.startsWith('/') ? new URL(requestedPath, window.location.origin) : null
      const sameSite = target?.origin === window.location.origin && !target.pathname.startsWith('//')

      router.replace(sameSite ? target.pathname + target.search : '/')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'เข้าสู่ระบบไม่ได้ กรุณาลองใหม่')
      setBusy(false)
    }
  }

  return (
    <Box component='main' sx={{ minHeight: '100dvh', display: 'grid', gridTemplateColumns: { md: 'minmax(0, 1fr) minmax(0, 1fr)' } }}>
      <Stack
        sx={{
          bgcolor: '#10372f',
          color: '#fff',
          px: { xs: 3, sm: 6, lg: 9 },
          py: { xs: 3, md: 6 },
          justifyContent: 'space-between',
          borderBottom: '4px solid #d7383d',
          backgroundImage: { md: 'linear-gradient(145deg, #123c34, #0d261f)' }
        }}
      >
        <Logo color='#fff' />
        <Box sx={{ display: { xs: 'none', md: 'block' }, maxWidth: 620, my: 7 }}>
          <Box aria-hidden sx={{ width: 54, height: 4, bgcolor: '#ef5d60', mb: 3 }} />
          <Typography component='p' sx={{ color: '#a5dcc7', fontWeight: 700, mb: 1 }}>Engineering &amp; Technology</Typography>
          <Typography
            component='p'
            sx={{ color: 'inherit', fontSize: { md: '2.65rem', lg: '3.6rem' }, lineHeight: 1.22, fontWeight: 800 }}
          >
            รายงานบริการและประวัติงานในที่เดียว
          </Typography>
          <Typography sx={{ color: '#c2d8d0', mt: 2.5 }}>บันทึกงานบริการของแต่ละโครงการและจัดทำเอกสารสำหรับส่งมอบ</Typography>
        </Box>
        <Typography variant='body2' sx={{ display: { xs: 'none', md: 'block' }, color: '#b9d4ca' }}>G Innovation Co., Ltd.</Typography>
      </Stack>
      <Stack justifyContent='center' alignItems='center' sx={{ p: { xs: 3, sm: 6, lg: 8 }, bgcolor: 'background.paper' }}>
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Typography component='h1' sx={{ fontWeight: 800, fontSize: { xs: '1.85rem', md: '2.3rem' } }}>เข้าสู่ระบบ</Typography>
          <Typography color='text.secondary' sx={{ mb: 3.5 }}>ใช้บัญชีของคุณเพื่อเปิดระบบรายงานบริการ</Typography>
          <Stack component='form' onSubmit={handleLogin} spacing={2}>
            {error && <Alert severity='error'>{error}</Alert>}
            <TextField label='ชื่อผู้ใช้' name='username' autoComplete='username' required value={username} onChange={event => setUsername(event.target.value)} />
            <TextField
              label='รหัสผ่าน'
              name='password'
              autoComplete='current-password'
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={event => setPassword(event.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                      edge='end'
                    >
                      {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              type='submit'
              variant='contained'
              size='large'
              disabled={busy}
              startIcon={busy ? <CircularProgress size={18} color='inherit' aria-hidden /> : <LockOpenOutlined />}
            >
              {busy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
            </Button>
          </Stack>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 3 }}>หากเข้าใช้งานไม่ได้ ติดต่อผู้ดูแลระบบของคุณ</Typography>
        </Box>
      </Stack>
    </Box>
  )
}
