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
import CircularProgress from '@mui/material/CircularProgress' // Import CircularProgress for loading indicator
import Snackbar from '@mui/material/Snackbar' // Import Snackbar for messages
import MuiAlert from '@mui/material/Alert' // Import Alert for Snackbar content
import type { AlertProps } from '@mui/material/Alert' // Type for Alert

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// API Import (New)
import { login } from '@/libs/api/auth' // Adjust this path as per your file structure

// Helper for Snackbar Alert
function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant='filled' {...props} />
}

const Login = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // CHANGED: Renamed 'error' to 'snackbarDisplayMessage' for clarity
  const [snackbarDisplayMessage, setSnackbarDisplayMessage] = useState<string>('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  // CHANGED: Added 'snackbarSeverity' state to explicitly control alert severity
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info')

  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const router = useRouter()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }

    setSnackbarOpen(false)
    setSnackbarDisplayMessage('') // Clear message when snackbar closes
    setSnackbarSeverity('info') // Reset severity
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setSnackbarOpen(false) // Close any existing snackbars
    setSnackbarDisplayMessage('') // Clear previous message
    setSnackbarSeverity('info') // Reset severity

    try {
      // Assuming 'login' returns boolean success or throws an error
      const success = await login(username, password)

      if (success) {
        // Login successful
        setSnackbarDisplayMessage('เข้าสู่ระบบสำเร็จ!')
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
        router.push('/admin/services') // Redirect to dashboard or desired page
      } else {
        // Login failed, and the 'login' function returned false
        setSnackbarDisplayMessage('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง')
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
      }
    } catch (apiError: any) {
      // Network or unexpected error, or error thrown by 'login' function
      console.error('Login API call failed:', apiError)
      setSnackbarDisplayMessage(apiError.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    } finally {
      setLoading(false) // End loading
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
            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <TextField
                autoFocus
                fullWidth
                label='Username'
                value={username}
                onChange={e => setUsername(e.target.value)}
                error={snackbarOpen && snackbarSeverity === 'error'}
                autoComplete='username'
              />
              <TextField
                fullWidth
                label='Password'
                id='outlined-adornment-password'
                type={isPasswordShown ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={snackbarOpen && snackbarSeverity === 'error'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
                <FormControlLabel control={<Checkbox />} label='Remember me' />
                <Typography className='text-end' color='primary' component={Link} href='/forgot-password'>
                  Forgot password?
                </Typography>
              </div>
              <Button
                fullWidth
                variant='contained'
                type='submit'
                disabled={loading} // Disable button when loading
                startIcon={loading ? <CircularProgress size={20} color='inherit' /> : null} // Show spinner
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
                <IconButton size='small' className='text-facebook'>
                  <i className='ri-facebook-fill' />
                </IconButton>
                <IconButton size='small' className='text-twitter'>
                  <i className='ri-twitter-fill' />
                </IconButton>
                <IconButton size='small' className='text-github'>
                  <i className='ri-github-fill' />
                </IconButton>
                <IconButton size='small' className='text-googlePlus'>
                  <i className='ri-google-fill' />
                </IconButton>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />

      {/* Snackbar for showing messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarDisplayMessage}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default Login
