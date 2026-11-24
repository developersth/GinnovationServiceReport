import type { ReactNode } from 'react'

import { Box, Stack, Typography } from '@mui/material'

type PageHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ sm: 'center' }}
      justifyContent='space-between'
      gap={2}
      mb={3}
    >
      <Box>
        <Typography component='h1' sx={{ fontSize: { xs: '1.65rem', md: '2rem' }, fontWeight: 800 }}>
          {title}
        </Typography>
        {description && <Typography color='text.secondary' mt={0.5}>{description}</Typography>}
      </Box>
      {action}
    </Stack>
  )
}
