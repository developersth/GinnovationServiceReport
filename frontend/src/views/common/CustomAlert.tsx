'use client' // This component might be used client-side for Snackbar

import * as React from 'react' // Required for React.forwardRef

import MuiAlert from '@mui/material/Alert'
import type { AlertProps } from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar' // Include Snackbar if you want to bundle it
import type { SnackbarProps } from '@mui/material/Snackbar'

// ----------------------------------------------------------------------------
// CustomAlert Component (for use directly, or within a Snackbar)
// ----------------------------------------------------------------------------
// This component correctly forwards the ref, which is crucial for
// Material-UI's transition components (like Grow used by Snackbar)
// to correctly measure the element and prevent "scrollTop of null" errors.
const CustomAlert = React.forwardRef<HTMLDivElement, AlertProps>(function CustomAlert(props, ref) {
  return <MuiAlert elevation={6} variant='filled' ref={ref} {...props} />
})

// ----------------------------------------------------------------------------
// Reusable Snackbar with CustomAlert
// ----------------------------------------------------------------------------
// This component combines Snackbar and CustomAlert for common usage,
// making it even easier to display alerts across your app.
interface CustomSnackbarAlertProps extends Omit<SnackbarProps, 'children' | 'open' | 'onClose'> {
  open: boolean
  message: string
  severity: AlertProps['severity']
  onClose: SnackbarProps['onClose']
}

export function CustomSnackbarAlert({
  open,
  message,
  severity,
  onClose,
  anchorOrigin = { vertical: 'top', horizontal: 'center' }, // Default position
  autoHideDuration = 6000, // Default duration
  ...restSnackbarProps
}: CustomSnackbarAlertProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      {...restSnackbarProps}
    >
      <CustomAlert
        onClose={onClose ? event => onClose(event as React.SyntheticEvent<any, Event>, 'clickaway') : undefined}
        severity={severity}
      >
        {message}
      </CustomAlert>
    </Snackbar>
  )
}

export default CustomAlert // Export the Alert component directly as well
