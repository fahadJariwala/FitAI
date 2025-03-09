import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SignInScreen = ({ navigation }: any) => {
    const { signIn } = useAuth();
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            await signIn(email, password);
            // Navigation will be handled by the auth state change
        } catch (error) {
            console.error('SignIn error:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    // ... rest of your component code ...
}; 