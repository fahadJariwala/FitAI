import { createTheme } from '@shopify/restyle';

// Define the theme interface
export const palette = {
    primary: '#FF4B4B',
    secondary: '#4B9DFF',
    background: '#FFFFFF',
    backgroundDark: '#121212',
    card: '#F5F5F5',
    cardDark: '#1E1E1E',
    text: '#1A1A1A',
    textDark: '#FFFFFF',
    border: '#E0E0E0',
    borderDark: '#2C2C2C',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFC107',
    info: '#2196F3',
};

const theme = createTheme({
    colors: {
        primary: palette.primary,
        secondary: palette.secondary,
        background: palette.background,
        card: palette.card,
        text: palette.text,
        border: palette.border,
        success: palette.success,
        error: palette.error,
        warning: palette.warning,
        info: palette.info,
        onPrimary: palette.textDark
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 40,
    },
    borderRadii: {
        xs: 4,
        s: 8,
        m: 12,
        l: 16,
        xl: 24,
        xxl: 32,
    },
    textVariants: {
        header: {
            fontSize: 32,
            fontWeight: 'bold',
        },
        subheader: {
            fontSize: 24,
            fontWeight: '600',
        },
        body: {
            fontSize: 16,
        },
        caption: {
            fontSize: 14,
        },
    },
});

export const darkTheme = {
    ...theme,
    colors: {
        ...theme.colors,
        background: palette.backgroundDark,
        card: palette.cardDark,
        text: palette.textDark,
        border: palette.borderDark,
    },
};

export type Theme = typeof theme;
export default theme; 