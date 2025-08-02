// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// ✅ Google Font Import
import { Sarabun } from 'next/font/google'

// Type Imports
import type { ChildrenType } from '@core/types'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

const sarabun = Sarabun({
  weight: ['300', '400', '500', '700'],
  subsets: ['thai'],
  display: 'swap'
})

export const metadata = {
  title: 'G Innovation - Service Report',
  description:
    'Develop next-level web apps with Materio Dashboard Free - NextJS. Now, updated with lightning-fast routing powered by MUI and App router.'
}

const RootLayout = ({ children }: ChildrenType) => {
  // Vars
  const direction = 'ltr'

  return (
    <html id='__next' dir={direction} lang='th'>
      <body className={`flex is-full min-bs-full flex-auto flex-col ${sarabun.className}`}>{children}</body>
    </html>
  )
}

export default RootLayout
