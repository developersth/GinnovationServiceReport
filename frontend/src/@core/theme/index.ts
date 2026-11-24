// MUI Imports
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { SystemMode } from '@core/types'

// Theme Options Imports
import overrides from './overrides'
import colorSchemes from './colorSchemes'
import spacing from './spacing'
import shadows from './shadows'
import customShadows from './customShadows'
import typography from './typography'

const theme = (mode: SystemMode, direction: Theme['direction']): Theme => {
  return {
    direction,
    components: overrides(),
    colorSchemes: colorSchemes(),
    ...spacing,
    shape: {
      borderRadius: 10,
      customBorderRadius: {
        xs: 2,
        sm: 4,
        md: 6,
        lg: 8,
        xl: 10
      }
    },
    shadows: shadows(mode),
    typography: typography('var(--font-sarabun)'),
    customShadows: customShadows(mode),
    mainColorChannels: {
      light: '24 37 36',
      dark: '232 241 239',
      lightShadow: '25 48 44',
      darkShadow: '10 23 21'
    }
  } as Theme
}

export default theme
