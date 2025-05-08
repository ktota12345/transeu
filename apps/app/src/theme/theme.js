import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#e6f7ff',
    100: '#b3e0ff',
    200: '#80caff',
    300: '#4db3ff',
    400: '#1a9dff',
    500: '#0080ff',
    600: '#0066cc',
    700: '#004d99',
    800: '#003366',
    900: '#001a33',
  },
  secondary: {
    50: '#f2f2f2',
    100: '#d9d9d9',
    200: '#bfbfbf',
    300: '#a6a6a6',
    400: '#8c8c8c',
    500: '#737373',
    600: '#595959',
    700: '#404040',
    800: '#262626',
    900: '#0d0d0d',
  },
  success: {
    500: '#38b2ac',
  },
  warning: {
    500: '#dd6b20',
  },
  error: {
    500: '#e53e3e',
  },
};

const fonts = {
  heading: '"Roboto", sans-serif',
  body: '"Open Sans", sans-serif',
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'md',
    },
    variants: {
      solid: (props) => ({
        bg: props.colorScheme === 'blue' ? 'brand.500' : undefined,
        _hover: {
          bg: props.colorScheme === 'blue' ? 'brand.600' : undefined,
        },
      }),
      outline: (props) => ({
        borderColor: props.colorScheme === 'blue' ? 'brand.500' : undefined,
        color: props.colorScheme === 'blue' ? 'brand.500' : undefined,
        _hover: {
          bg: props.colorScheme === 'blue' ? 'brand.50' : undefined,
        },
      }),
    },
  },
  Table: {
    variants: {
      simple: {
        th: {
          borderBottom: '2px solid',
          borderColor: 'gray.200',
          fontWeight: 'bold',
          textTransform: 'none',
          letterSpacing: 'normal',
        },
        td: {
          borderBottom: '1px solid',
          borderColor: 'gray.100',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'lg',
        boxShadow: 'md',
        overflow: 'hidden',
      },
    },
  },
  Tag: {
    baseStyle: {
      container: {
        borderRadius: 'full',
      },
    },
  },
};

const styles = {
  global: {
    body: {
      bg: 'gray.50',
      color: 'gray.800',
    },
  },
};

const theme = extendTheme({
  colors,
  fonts,
  components,
  styles,
});

export default theme;
