import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './context/ThemeContext';
import { AlertProvider } from './context/AlertContext';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

export default function App() {
    SplashScreen.hide();

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AlertProvider>
                    <AuthProvider>
                        <NavigationContainer>
                            <AppNavigator />
                        </NavigationContainer>
                    </AuthProvider>
                </AlertProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
} 