'use client'

// React Imports
import { useMemo } from 'react'

// MUI Imports
import { deepmerge } from '@mui/utils'
import {
  Experimental_CssVarsProvider as CssVarsProvider,
  experimental_extendTheme as extendTheme,
  lighten,
  darken
} from '@mui/material/styles'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import CssBaseline from '@mui/material/CssBaseline'
import type {} from '@mui/material/themeCssVarsAugmentation' //! Do not remove this import otherwise you will get type errors while making a production build
import type {} from '@mui/lab/themeAugmentation' //! Do not remove this import otherwise you will get type errors while making a production build

// Type Imports
import type { ChildrenType, Direction } from '@core/types'

// Component Imports
import ModeChanger from './ModeChanger'

// Config Imports
import themeConfig from '@configs/themeConfig'
import primaryColorConfig from '@configs/primaryColorConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Core Theme Imports
import defaultCoreTheme from '@core/theme'

type Props = ChildrenType & {
  direction: Direction
}

const ThemeProvider = (props: Props) => {
  // Props
  const { children, direction } = props

  // Hooks
  const { settings } = useSettings()

  // Merge the primary color scheme override with the core theme
  const theme = useMemo(() => {
    const newColorScheme = {
      colorSchemes: {
        light: {
          palette: {
            primary: {
              main: primaryColorConfig[0].main,
              light: lighten(primaryColorConfig[0].main as string, 0.2),
              dark: darken(primaryColorConfig[0].main as string, 0.1),
              contrastText: '#fff'
            },
            background: { default: '#F3F6F5', paper: '#FFFFFF' },
            success: { main: '#147553' }
          }
        },
        dark: {
          palette: {
            primary: {
              main: '#FF8581',
              light: '#FFA4A0',
              dark: '#E96563',
              contrastText: '#281211'
            },
            background: { default: '#141D1C', paper: '#1D2927' },
            success: { main: '#61C79D' }
          }
        }
      }
    }

    const coreTheme = deepmerge(defaultCoreTheme(settings.mode || 'light', direction), {
      ...newColorScheme,
      components: {
        MuiButton: { styleOverrides: { root: { fontWeight: 700, minHeight: 40 } } },
        MuiCard: { styleOverrides: { root: { backgroundImage: 'none' } } },
        MuiTableCell: { styleOverrides: { head: { fontWeight: 700 } } }
      }
    })

    return extendTheme(coreTheme)

  }, [settings.mode, direction])

  return (
    <AppRouterCacheProvider options={{ prepend: true }}>
      <CssVarsProvider
        theme={theme}
        defaultMode={settings.mode}
        modeStorageKey={`${themeConfig.templateName.toLowerCase().split(' ').join('-')}-mui-template-mode`}
      >
        <>
          <ModeChanger />
          <CssBaseline />
          {children}
        </>
      </CssVarsProvider>
    </AppRouterCacheProvider>
  )
}

export default ThemeProvider
