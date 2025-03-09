import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
    Keyboard,
} from 'react-native';
import { Icon } from '../components/Icon';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';
import { typography } from '../styles/typeograpghy';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

interface FormData {
    name: string;
    age: string;
    weight: string;
    fitnessGoal: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    name?: string;
    age?: string;
    weight?: string;
    fitnessGoal?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

const SignupScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const { showAlert } = useAlert();
    const { signUp } = useAuth();

    const [formData, setFormData] = useState<FormData>({
        name: '',
        age: '',
        weight: '',
        fitnessGoal: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const scrollViewRef = useRef(null);

    const handleFocus = (inputPosition: number) => {
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({
                y: inputPosition,
                animated: true,
            });
        }, 100);
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        }

        // Age validation
        const age = parseInt(formData.age);
        if (!formData.age || isNaN(age)) {
            newErrors.age = 'Valid age is required';
            isValid = false;
        } else if (age < 13 || age > 100) {
            newErrors.age = 'Age must be between 13 and 100';
            isValid = false;
        }

        // Weight validation
        const weight = parseFloat(formData.weight);
        if (!formData.weight || isNaN(weight)) {
            newErrors.weight = 'Valid weight is required';
            isValid = false;
        } else if (weight < 30 || weight > 300) {
            newErrors.weight = 'Weight must be between 30 and 300 kg';
            isValid = false;
        }

        // Fitness goal validation
        if (!formData.fitnessGoal.trim()) {
            newErrors.fitnessGoal = 'Fitness goal is required';
            isValid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
            isValid = false;
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSignup = async () => {
        if (validateForm()) {
            try {
                setLoading(true);

                // Step 1: Sign up the user
                const { data: authData, error: authError } = await signUp(formData.email, formData.password);

                if (authError) {
                    console.error('Auth Error:', authError);
                    const errorText = authError.message?.toLowerCase() || '';

                    if (errorText.includes('email already registered') ||
                        errorText.includes('already exists')) {
                        showAlert({
                            type: 'info',
                            title: 'Account Exists',
                            message: 'An account with this email already exists. Would you like to login instead?',
                            buttons: [
                                {
                                    text: 'Cancel',
                                    style: 'cancel',
                                    onPress: () => { },
                                },
                                {
                                    text: 'Go to Login',
                                    style: 'default',
                                    onPress: () => navigation.replace('Login'),
                                },
                            ],
                        });
                        return;
                    }

                    throw new Error(authError.message);
                }

                if (!authData?.user?.id) {
                    throw new Error('User creation failed');
                }

                // Step 2: Create user profile
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .insert({
                        user_id: authData.user.id,
                        name: formData.name.trim(),
                        age: parseInt(formData.age),
                        weight: parseFloat(formData.weight),
                        fitness_goal: formData.fitnessGoal.trim()
                    });

                if (profileError) {
                    throw new Error('Failed to create user profile');
                }

                // Step 3: Sign in the user automatically
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });

                if (signInError) {
                    throw new Error('Account created but failed to sign in');
                }

                // Step 4: Navigate to MainApp directly
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainApp' }],
                });

            } catch (error: any) {
                console.error('Signup process error:', error);

                // If we have a user but profile creation failed, try to clean up
                if (error.message?.includes('profile') && authData?.user?.id) {
                    try {
                        await supabase.auth.admin.deleteUser(authData.user.id);
                    } catch (cleanupError) {
                        console.error('Failed to cleanup user after profile creation error:', cleanupError);
                    }
                }

                showAlert({
                    type: 'error',
                    title: 'Signup Failed',
                    message: error?.message || 'An error occurred during signup',
                    buttons: [
                        {
                            text: 'OK',
                            style: 'default',
                            onPress: () => { },
                        },
                    ],
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        scrollContent: {
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: Platform.OS === 'ios' ? 60 : 40,
            paddingBottom: Platform.OS === 'ios' ? 100 : 80,
        },
        title: {
            ...typography.h1,
            color: theme.colors.text,
            marginBottom: 10,
        },
        subtitle: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            ...typography.label,
            marginBottom: 30,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.inputBackground,
            borderRadius: 12,
            marginBottom: 8,
            paddingHorizontal: 15,
            height: 55,
            borderWidth: 1,
            borderColor: theme.colors.inputBorder,
        },
        input: {
            flex: 1,
            fontSize: 16,
            color: theme.colors.inputText,
        },
        errorText: {
            color: theme.colors.error,
            fontSize: 12,
            marginBottom: 10,
            marginLeft: 5,
        },
        signupButton: {
            backgroundColor: theme.colors.buttonPrimary,
            borderRadius: 12,
            height: 55,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20,
            opacity: loading ? 0.7 : 1,
        },
        signupButtonText: {
            color: theme.colors.buttonPrimaryText,
            fontSize: 18,
            fontWeight: 'bold',
        },
        loginLink: {
            marginTop: 20,
            alignItems: 'center',
        },
        loginLinkText: {
            color: theme.colors.textSecondary,
            fontSize: 14,
        },
        loginText: {
            color: theme.colors.link,
            fontSize: 14,
            fontWeight: 'bold',
        },
    });

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
            >
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join FitAI to start your fitness journey</Text>

                {/* Name Input */}
                <View style={styles.inputContainer}>
                    <Icon name="account" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor={theme.colors.inputPlaceholder}
                        value={formData.name}
                        onChangeText={(text) => {
                            setFormData((prev) => ({ ...prev, name: text }));
                            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        onFocus={() => handleFocus(0)}
                    />
                </View>
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                {/* Age Input */}
                <View style={styles.inputContainer}>
                    <Icon name="calendar" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={styles.input}
                        placeholder="Age"
                        placeholderTextColor={theme.colors.inputPlaceholder}
                        value={formData.age}
                        onChangeText={(text) => {
                            setFormData((prev) => ({ ...prev, age: text }));
                            if (errors.age) setErrors((prev) => ({ ...prev, age: undefined }));
                        }}
                        keyboardType="numeric"
                        onFocus={() => handleFocus(50)}
                    />
                </View>
                {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}

                {/* Weight Input */}
                <View style={styles.inputContainer}>
                    <Icon name="weight" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={styles.input}
                        placeholder="Weight (kg)"
                        placeholderTextColor={theme.colors.inputPlaceholder}
                        value={formData.weight}
                        onChangeText={(text) => {
                            setFormData((prev) => ({ ...prev, weight: text }));
                            if (errors.weight) setErrors((prev) => ({ ...prev, weight: undefined }));
                        }}
                        keyboardType="numeric"
                        onFocus={() => handleFocus(100)}
                    />
                </View>
                {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}

                {/* Fitness Goal Input */}
                <View style={styles.inputContainer}>
                    <Icon name="target" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={styles.input}
                        placeholder="Fitness Goal"
                        placeholderTextColor={theme.colors.inputPlaceholder}
                        value={formData.fitnessGoal}
                        onChangeText={(text) => {
                            setFormData((prev) => ({ ...prev, fitnessGoal: text }));
                            if (errors.fitnessGoal) setErrors((prev) => ({ ...prev, fitnessGoal: undefined }));
                        }}
                        onFocus={() => handleFocus(150)}
                    />
                </View>
                {errors.fitnessGoal && <Text style={styles.errorText}>{errors.fitnessGoal}</Text>}

                {/* Email Input */}
                <View style={styles.inputContainer}>
                    <Icon name="email" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor={theme.colors.inputPlaceholder}
                        value={formData.email}
                        onChangeText={(text) => {
                            setFormData((prev) => ({ ...prev, email: text }));
                            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onFocus={() => handleFocus(200)}
                    />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                {/* Password Input */}
                <View style={styles.inputContainer}>
                    <Icon name="lock" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor={theme.colors.inputPlaceholder}
                        value={formData.password}
                        onChangeText={(text) => {
                            setFormData((prev) => ({ ...prev, password: text }));
                            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        secureTextEntry={!showPassword}
                        onFocus={() => handleFocus(450)}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Icon
                            name={showPassword ? "eye-off" : "eye"}
                            size={20}
                            color={theme.colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                    <Icon name="lock-check" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor={theme.colors.inputPlaceholder}
                        value={formData.confirmPassword}
                        onChangeText={(text) => {
                            setFormData((prev) => ({ ...prev, confirmPassword: text }));
                            if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                        }}
                        secureTextEntry={!showConfirmPassword}
                        onFocus={() => handleFocus(520)}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Icon
                            name={showConfirmPassword ? "eye-off" : "eye"}
                            size={20}
                            color={theme.colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

                <TouchableOpacity
                    style={styles.signupButton}
                    onPress={() => {
                        Keyboard.dismiss();
                        handleSignup();
                    }}
                    disabled={loading}
                >
                    <Text style={styles.signupButtonText}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.loginLink}
                    onPress={() => navigation.navigate('LoginScreen')}
                >
                    <Text style={styles.loginLinkText}>
                        Don't have an account?{' '}
                        <Text style={styles.loginText}>Login</Text>
                    </Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default SignupScreen; 