import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

export const Navigation = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />; // Create a loading screen component
    }

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {user ? (
                    // Authenticated stack
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="Profile" component={ProfileScreen} />
                        {/* Add other authenticated screens */}
                    </>
                ) : (
                    // Non-authenticated stack
                    <>
                        <Stack.Screen name="SignIn" component={SignInScreen} />
                        <Stack.Screen name="SignUp" component={SignUpScreen} />
                        {/* Add other non-authenticated screens */}
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}; 