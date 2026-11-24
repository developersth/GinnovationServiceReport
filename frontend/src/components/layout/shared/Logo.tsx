'use client'

import type { CSSProperties } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function Logo({ color }: { color?: CSSProperties['color'] }) {
  return (
    <Box display='flex' alignItems='center' gap={1.25}>
      <Box
        component='img'
        src={(process.env.BASEPATH || '') + '/images/logos/logo-g.png'}
        width={46}
        height={32}
        alt='G Innovation'
        sx={{ objectFit: 'contain', flexShrink: 0, bgcolor: '#fdfdfd', borderRadius: 0.5 }}
      />
      <Box>
        <Typography sx={{ fontWeight: 800, lineHeight: 1.15, color, whiteSpace: 'nowrap' }}>G Innovation</Typography>
        <Typography component='div' variant='caption' sx={{ color: color || 'text.secondary', lineHeight: 1.4 }}>
          Service Report
        </Typography>
      </Box>
    </Box>
  )
}
