import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, useColorScheme, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
}

interface Theme {
  colors: {
    background: string;
    text: string;
    primary: string;
    card: string;
    border: string;
  };
  spacing: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
  };
  borderRadii: {
    s: number;
    m: number;
    l: number;
  };
}

const lightTheme: Theme = {
  colors: {
    background: '#F8F9FA',
    text: '#212529',
    primary: '#0D6EFD',
    card: '#FFFFFF',
    border: '#DEE2E6',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
  borderRadii: {
    s: 4,
    m: 8,
    l: 16,
  },
};

const darkTheme: Theme = {
  colors: {
    background: '#212529',
    text: '#F8F9FA',
    primary: '#0D6EFD',
    card: '#343A40',
    border: '#495057',
  },
  spacing: lightTheme.spacing,
  borderRadii: lightTheme.borderRadii,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>('system');

  useEffect(() => {
    loadThemeType();
  }, []);

  const loadThemeType = async () => {
    try {
      const savedThemeType = await AsyncStorage.getItem('themeType');
      console.log('Loaded theme type:', savedThemeType);
      if (savedThemeType) {
        setThemeType(savedThemeType as ThemeType);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const saveThemeType = async (newThemeType: ThemeType) => {
    try {
      await AsyncStorage.setItem('themeType', newThemeType);
      console.log('Saved theme type:', newThemeType);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const handleThemeChange = async (newThemeType: ThemeType) => {
    console.log('Changing theme to:', newThemeType);
    setThemeType(newThemeType);
    await saveThemeType(newThemeType);
  };

  const getActiveTheme = (): Theme => {
    if (themeType === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeType === 'dark' ? darkTheme : lightTheme;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: getActiveTheme(),
        themeType,
        setThemeType: handleThemeChange,
      }}>
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
