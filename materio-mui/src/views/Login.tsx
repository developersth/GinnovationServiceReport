'use client'

// React Imports
import { useState } from 'react'
import type { FormEvent } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

// REMOVED: Snackbar and MuiAlert imports are no longer needed here
// as they are encapsulated within CustomSnackbarAlert
// import Snackbar from '@mui/material/Snackbar'
// import MuiAlert from '@mui/material/Alert'
// import type { AlertProps } from '@mui/material/Alert' // This type is also not needed here

// Type Imports
import type { Mode } from '@core/types' // Assuming this type is still relevant

// Component Imports
import Logo from '@components/layout/shared/Logo' // Path for Logo
import Illustrations from '@components/Illustrations' // Path for Illustrations

// Config Imports
import themeConfig from '@configs/themeConfig' // Path for themeConfig

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant' // Path for useImageVariant

// API Import
import { login } from '@/libs/api/auth' // Adjust this path if different (e.g., '../../lib/api/auth')

// NEW: Import the CustomSnackbarAlert component
import { CustomSnackbarAlert } from '@/views/common/CustomAlert' // <-- ADJUST THIS PATH if your CustomAlert.tsx is elsewhere

// REMOVED: This helper function is now part of CustomAlert.tsx
// function Alert(props: AlertProps) {
//   return <MuiAlert elevation={6} variant='filled' {...props} />
// }

// NOTE: No changes needed here, just a comment from previous iteration.
// Removed LoginFormProps interface and onLoginSuccess prop
// as the component now directly handles redirection via useRouter
// and the login API handles local storage management.
// If you still need a callback for specific parent component logic,
// you would re-add it here and in the component signature.

export default function LoginForm({ mode }: { mode: Mode }) {
  // Added mode prop for illustrations
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const [snackbarDisplayMessage, setSnackbarDisplayMessage] = useState<string>('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info')

  // Vars for Illustrations
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const router = useRouter()
  const authBackground = useImageVariant(mode, lightImg, darkImg) // Used for illustrations

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }

    setSnackbarOpen(false)
    setSnackbarDisplayMessage('') // Clear message when snackbar closes
    setSnackbarSeverity('info') // Reset severity
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault() // Prevent default form submission

    setLoading(true)
    setSnackbarOpen(false) // Close any existing snackbars
    setSnackbarDisplayMessage('') // Clear previous message
    setSnackbarSeverity('info') // Reset severity

    try {
      const success = await login(username, password)

      if (success) {
        setSnackbarDisplayMessage('เข้าสู่ระบบสำเร็จ!')
        setSnackbarSeverity('success')
        setSnackbarOpen(true)

        // Assuming your `login` API call already handles storing tokens/user info.
        router.push('/') // Redirect to dashboard or desired page
      } else {
        setSnackbarDisplayMessage('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง')
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
      }
    } catch (apiError: any) {
      console.error('Login API call failed:', apiError)
      setSnackbarDisplayMessage(apiError.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    } finally {
      setLoading(false) // End loading regardless of success or failure
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-5'>
            <div>
              <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}!👋🏻`}</Typography>
              <Typography className='mbs-1'>Please sign-in to your account and start the adventure</Typography>
            </div>
            <form noValidate autoComplete='off' onSubmit={handleLogin} className='flex flex-col gap-5'>
              <TextField
                autoFocus
                fullWidth
                label='Username'
                value={username}
                onChange={e => setUsername(e.target.value)}
                error={snackbarOpen && snackbarSeverity === 'error'}
                autoComplete='username'
                disabled={loading}
              />
              <TextField
                fullWidth
                label='Password'
                id='outlined-adornment-password'
                type={isPasswordShown ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={snackbarOpen && snackbarSeverity === 'error'}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                        disabled={loading}
                      >
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
                <FormControlLabel control={<Checkbox disabled={loading} />} label='Remember me' />
                <Typography className='text-end' color='primary' component={Link} href='/forgot-password'>
                  Forgot password?
                </Typography>
              </div>
              <Button
                fullWidth
                variant='contained'
                type='submit'
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color='inherit' /> : null}
              >
                {loading ? 'Logging In...' : 'Log In'}
              </Button>
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>New on our platform?</Typography>
                <Typography component={Link} href='/register' color='primary'>
                  Create an account
                </Typography>
              </div>
              <Divider className='gap-3'>or</Divider>
              <div className='flex justify-center items-center gap-2'>
                <IconButton size='small' className='text-facebook' disabled={loading}>
                  <i className='ri-facebook-fill' />
                </IconButton>
                <IconButton size='small' className='text-twitter' disabled={loading}>
                  <i className='ri-twitter-fill' />
                </IconButton>
                <IconButton size='small' className='text-github' disabled={loading}>
                  <i className='ri-github-fill' />
                </IconButton>
                <IconButton size='small' className='text-googlePlus' disabled={loading}>
                  <i className='ri-google-fill' />
                </IconButton>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />

      {/* REPLACED: Snackbar for showing messages */}
      {/* Use the new CustomSnackbarAlert component */}
      <CustomSnackbarAlert
        open={snackbarOpen}
        message={snackbarDisplayMessage}
        severity={snackbarSeverity}
        onClose={handleSnackbarClose}

        // You can still override default props if needed, e.g.:
        // autoHideDuration={5000}
        // anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </div>
  )
}
