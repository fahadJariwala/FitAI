/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { AlertProvider } from './src/context/AlertContext';
import SplashScreen from './src/screens/SplashScreen';
import { NavigationContainer } from '@react-navigation/native';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate any initialization tasks
    const initApp = async () => {
      try {
        // Add any initialization logic here
        // For example: await Font.loadAsync(), await AsyncStorage.getItem(), etc.

        // Simulate minimum splash screen duration
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AlertProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </AlertProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
