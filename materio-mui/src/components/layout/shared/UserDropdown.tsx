'use client'

// React Imports
import { useRef, useState, useEffect } from 'react' // Import useEffect
import type { MouseEvent } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

import { logout, getUserRole, checkAuth, getUsername } from '@/libs/api/auth' // Adjust this path if different

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)

  // New states for user info
  const [username, setUsername] = useState<string>('Guest') // Default to Guest
  const [role, setRole] = useState<string>('User') // Default to User
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUsername, setCurrentUsername] = useState<string | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()

  useEffect(() => {
    const authenticateUser = async () => {
      setIsLoadingAuth(true)
      const authStatus = checkAuth()

      if (authStatus) {
        setIsAuthenticated(true)
        setCurrentUsername(getUsername())
      } else {
        setIsAuthenticated(false)
        router.push('/login')
      }

      setIsLoadingAuth(false)
    }

    authenticateUser()
  }, [router])

  // Effect to read user info from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Ensure localStorage is available (client-side)
      const storedUsername = getUsername()
      const storedRole = getUserRole() // Assuming 'role' is also stored

      if (storedUsername) {
        setUsername(storedUsername)
      }

      if (storedRole) {
        setRole(storedRole)
      }
    }
  }, []) // Empty dependency array means this effect runs once after the initial render

  const handleLogout = async () => {
    try {
      await logout()

      setIsAuthenticated(false)
      setCurrentUsername(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    // If a URL is provided, and it's for logout, clear localStorage first

    if (url) {
      router.push(url)
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      // Don't close if clicking inside the anchor element that opened the dropdown
      return
    }

    setOpen(false)
  }

  if (!isAuthenticated && !isLoadingAuth) {
    return null
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <Avatar
          alt={username} // Use actual username for alt text
          src='/images/avatars/1.png' // Keep default avatar or dynamically load user avatar
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
        />
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className='shadow-lg'>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                    <Avatar alt={username} src='/images/avatars/1.png' />
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {currentUsername} {/* Display retrieved username */}
                      </Typography>
                      <Typography variant='caption'>{role}</Typography> {/* Display retrieved role */}
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='ri-user-3-line' />
                    <Typography color='text.primary'>My Profile</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='ri-settings-4-line' />
                    <Typography color='text.primary'>Settings</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='ri-money-dollar-circle-line' />
                    <Typography color='text.primary'>Pricing</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e)}>
                    <i className='ri-question-line' />
                    <Typography color='text.primary'>FAQ</Typography>
                  </MenuItem>
                  <div className='flex items-center plb-2 pli-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='ri-logout-box-r-line' />}
                      onClick={handleLogout}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      Logout
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
