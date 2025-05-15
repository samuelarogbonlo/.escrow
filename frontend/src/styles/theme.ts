import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    primary: {
      50: '#e6e6ff',
      100: '#c4c6ff',
      200: '#a2a5fc',
      300: '#8183f4',
      400: '#6366f1', // Primary brand color
      500: '#4f46e5',
      600: '#4338ca',
      700: '#3730a3',
      800: '#312e81',
      900: '#1e1b4b'
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    success: {
      500: '#10b981'
    },
    warning: {
      500: '#f59e0b'
    },
    error: {
      500: '#ef4444'
    }
  },
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif"
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md'
      },
      variants: {
        solid: {
          bg: 'primary.400',
          color: 'white',
          _hover: {
            bg: 'primary.500'
          }
        },
        outline: {
          borderColor: 'primary.400',
          color: 'primary.400',
          _hover: {
            bg: 'primary.50'
          }
        }
      }
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          boxShadow: 'md',
          p: 4
        }
      }
    }
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800'
      }
    }
  }
})

export default theme 