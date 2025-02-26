import React, {createContext, useContext, useEffect, useState} from 'react';
import {Appearance} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme, {darkTheme, Theme} from '../theme/theme';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: theme,
  themeType: 'system',
  setThemeType: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [themeType, setThemeType] = useState<ThemeType>('system');
  const [currentTheme, setCurrentTheme] = useState<Theme>(theme);

  useEffect(() => {
    loadThemeType();
  }, []);

  useEffect(() => {
    updateTheme();
    saveThemeType();
  }, [themeType]);

  const loadThemeType = async () => {
    try {
      const savedThemeType = await AsyncStorage.getItem('themeType');
      if (savedThemeType) {
        setThemeType(savedThemeType as ThemeType);
      }
    } catch (error) {
      console.error('Error loading theme type:', error);
    }
  };

  const saveThemeType = async () => {
    try {
      await AsyncStorage.setItem('themeType', themeType);
    } catch (error) {
      console.error('Error saving theme type:', error);
    }
  };

  const updateTheme = () => {
    if (themeType === 'system') {
      const colorScheme = Appearance.getColorScheme();
      setCurrentTheme(colorScheme === 'dark' ? darkTheme : theme);
    } else {
      setCurrentTheme(themeType === 'dark' ? darkTheme : theme);
    }
  };

  const handleThemeTypeChange = (type: ThemeType) => {
    setThemeType(type);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        themeType,
        setThemeType: handleThemeTypeChange,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};
