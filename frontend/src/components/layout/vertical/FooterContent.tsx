'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  // Hooks

  return (
    <div
      className={classnames(verticalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <span>{`© ${new Date().getFullYear()} `}</span>
        <Link href='https://www.ginnovation.co.th/' target='_blank' rel='noopener noreferrer' className='text-primary'>
          G Innovation Co., Ltd.
        </Link>
      </p>
    </div>
  )
}

export default FooterContent
