'use client'

import { useState } from 'react'
import type { MouseEvent } from 'react'

import { useRouter } from 'next/navigation'

import { Avatar, Divider, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import LogoutOutlined from '@mui/icons-material/LogoutOutlined'

import { getName, getUsername, getUserRole, logout } from '@/libs/api/auth'

export default function UserDropdown() {
  const router = useRouter()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const username = typeof window === 'undefined' ? '' : getUsername()
  const name = typeof window === 'undefined' ? '' : getName() || username
  const role = typeof window === 'undefined' ? '' : getUserRole()

  function signOut() {
    setAnchor(null)
    logout()
    router.replace('/login')
  }

  return (
    <>
      <IconButton aria-label='บัญชีผู้ใช้' aria-expanded={Boolean(anchor)} onClick={(event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget)}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700 }}>
          {name?.charAt(0).toUpperCase() || 'G'}
        </Avatar>
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <Typography component='div' sx={{ px: 2, pt: 0.5, fontWeight: 700 }}>{name}</Typography>
        <Typography component='div' variant='body2' color='text.secondary' sx={{ px: 2, pb: 0.75 }}>{role}</Typography>
        <Divider />
        <MenuItem onClick={signOut} sx={{ gap: 1 }}><LogoutOutlined fontSize='small' /> ออกจากระบบ</MenuItem>
      </Menu>
    </>
  )
}
