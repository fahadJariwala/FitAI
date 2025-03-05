import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../context/ThemeContext';
import {typography} from '../styles/typeograpghy';
import {useAuth} from '../context/AuthContext';

const {width} = Dimensions.get('window');

const LoginScreen = ({navigation}) => {
  const {theme} = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingBottom: 20,
    },
    headerContainer: {
      marginBottom: 40,
    },
    title: {
      // fontWeight: 'bold',
      // color: '#333',
      color: theme.colors.text,
      marginBottom: 10,
      ...typography.h1,
    },
    subtitle: {
      // fontSize: 16,
      // color: '#666',
      color: theme.colors.secondaryText,
      ...typography.body,
    },
    formContainer: {
      width: '100%',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 8,
      paddingHorizontal: 15,
      height: 55,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: '#333',
    },
    eyeIcon: {
      padding: 10,
    },
    errorText: {
      color: theme.colors.error,
      ...typography.caption,
      // fontSize: 12,
      marginBottom: 10,
      marginLeft: 5,
    },
    loginButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      height: 55,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    loginButtonText: {
      color: theme.colors.onPrimary,
      ...typography.button,
      // fontSize: 18,
      // fontWeight: 'bold',
    },
    signupContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
    },
    signupText: {
      color: '#666',
      fontSize: 14,
    },
    signupLink: {
      color: '#007AFF',
      fontSize: 14,
      fontWeight: 'bold',
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadii.m,
      padding: theme.spacing.m,
      alignItems: 'center',
      marginBottom: theme.spacing.m,
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
  });

  const {signIn, signUp} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {email: '', password: ''};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      try {
        setLoading(true);
        await signIn(email, password);
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
        navigation.replace('MainApp');
      }
    }
  };
  const handleSignUp = async () => {
    if (validateForm()) {
      try {
        setLoading(true);
        await signUp(email, password);
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
        navigation.replace('UserDetails');
      }
    }
  };

  //localinvestor.com/home-demo-2/

  https: return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome to Fit AI!</Text>
          <Text style={styles.subtitle}>
            Sign in to continue your fitness journey
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Icon
              name="email-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (errors.email) {
                  setErrors(prev => ({...prev, email: ''}));
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}

          <View style={styles.inputContainer}>
            <Icon
              name="lock-outline"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, {flex: 1}]}
              placeholder="Password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (errors.password) {
                  setErrors(prev => ({...prev, password: ''}));
                }
              }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}>
              <Icon
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: theme.colors.card}]}
            onPress={handleSignUp}
            disabled={loading}>
            <Text style={[styles.buttonText, {color: theme.colors.text}]}>
              Create Account
            </Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            {/* <Text style={styles.signupText}>Don't have an account? </Text> */}
            <TouchableOpacity
              style={[styles.button, {backgroundColor: theme.colors.card}]}
              onPress={handleSignUp}
              disabled={loading}>
              <Text style={[styles.buttonText, {color: theme.colors.text}]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
