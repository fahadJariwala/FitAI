import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, useColorScheme, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'light' | 'dark' | 'system';

interface ThemeColors {
  colors: {
    // Base colors
    background: string;
    text: string;
    primary: string;
    card: string;
    border: string;
    error: string;

    // Input colors
    inputBackground: string;
    inputBorder: string;
    inputText: string;
    inputPlaceholder: string;

    // Button colors
    buttonPrimary: string;
    buttonPrimaryText: string;
    buttonSecondary: string;
    buttonSecondaryText: string;

    // Text variants
    textSecondary: string;
    textTertiary: string;
    link: string;

    // Status colors
    success: string;
    warning: string;
    info: string;
  }
  spacing: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
  },
  borderRadii: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
  },
  textVariants: {
    header: {
      fontSize: number;
      fontWeight: string;
    };
  }
}

export const lightTheme: ThemeColors = {
  colors: {
    // Base colors
    background: '#FFFFFF',
    text: '#000000',
    primary: '#FF4B4B',
    card: '#F5F5F5',
    border: '#E0E0E0',
    error: '#FF3B30',

    // Input colors
    inputBackground: '#F5F5F5',
    inputBorder: '#E0E0E0',
    inputText: '#000000',
    inputPlaceholder: '#666666',

    // Button colors
    buttonPrimary: '#FF4B4B',
    buttonPrimaryText: '#FFFFFF',
    buttonSecondary: '#F5F5F5',
    buttonSecondaryText: '#000000',

    // Text variants
    textSecondary: '#666666',
    textTertiary: '#999999',
    link: '#FF4B4B',

    // Status colors
    success: '#34C759',
    warning: '#FF9500',
    info: '#5856D6',
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
};

export const darkTheme: ThemeColors = {
  colors: {
    // Base colors
    background: '#000000',
    text: '#FFFFFF',
    primary: '#FF4B4B',
    card: '#1C1C1E',
    border: '#38383A',
    error: '#FF453A',

    // Input colors
    inputBackground: '#1C1C1E',
    inputBorder: '#38383A',
    inputText: '#FFFFFF',
    inputPlaceholder: '#8E8E93',

    // Button colors
    buttonPrimary: '#FF4B4B',
    buttonPrimaryText: '#FFFFFF',
    buttonSecondary: '#1C1C1E',
    buttonSecondaryText: '#FFFFFF',

    // Text variants
    textSecondary: '#8E8E93',
    textTertiary: '#636366',
    link: '#FF4B4B',

    // Status colors
    success: '#30D158',
    warning: '#FF9F0A',
    info: '#5E5CE6',
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
};

interface ThemeContextType {
  theme: ThemeColors;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>('system');

  const handleThemeChange = (currentThemeType: ThemeType, systemScheme: string | null) => {
    if (currentThemeType === 'system') {
      return systemScheme === 'dark' ? darkTheme : lightTheme;
    }
    return currentThemeType === 'dark' ? darkTheme : lightTheme;
  };

  const [theme, setTheme] = useState(() =>
    handleThemeChange(themeType, systemColorScheme)
  );

  // Fixed AppState listener
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && themeType === 'system') {
        const currentSystemTheme = Appearance.getColorScheme();
        setTheme(handleThemeChange(themeType, currentSystemTheme));
      }
    });

    // Also listen for system theme changes
    const themeSubscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeType === 'system') {
        setTheme(handleThemeChange(themeType, colorScheme));
      }
    });

    return () => {
      subscription.remove();
      themeSubscription.remove();
    };
  }, [themeType]);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themeType');
        if (savedTheme) {
          setThemeType(savedTheme as 'light' | 'dark' | 'system');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, themeType, setThemeType }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
