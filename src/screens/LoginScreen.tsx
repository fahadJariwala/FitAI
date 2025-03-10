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
import {useNavigation} from '@react-navigation/native';
import {useAlert} from '../context/AlertContext';

const {width} = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const {theme} = useTheme();
  const {signIn, signUp} = useAuth();
  const {showAlert} = useAlert();

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
      ...typography.h1,
      color: theme.colors.text,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      ...typography.label,
    },
    formContainer: {
      width: '100%',
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
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.inputText,
    },
    eyeIcon: {
      padding: 10,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginBottom: 10,
      marginLeft: 5,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginTop: 10,
      marginBottom: 20,
    },
    forgotPasswordText: {
      color: theme.colors.link,
      fontSize: 14,
    },
    loginButton: {
      backgroundColor: theme.colors.buttonPrimary,
      borderRadius: 12,
      height: 55,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
      shadowColor: theme.colors.buttonPrimary,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    signupbutton: {
      backgroundColor: theme.colors.buttonSecondary,
      borderRadius: 12,
      height: 55,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    loginButtonText: {
      color: theme.colors.buttonPrimaryText,
      fontSize: 18,
      fontWeight: 'bold',
    },
    signupContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
    },
    signupText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    signupLink: {
      color: theme.colors.link,
      fontSize: 14,
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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

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
        const {error} = await signIn(email, password);

        if (error) {
          throw error;
        }

        // Reset navigation stack and navigate to MainApp
        navigation.reset({
          index: 0,
          routes: [{name: 'MainApp'}],
        });
      } catch (error: any) {
        showAlert({
          type: 'error',
          title: 'Login Failed',
          message: error?.message || 'Invalid email or password',
          buttons: [
            {
              text: 'OK',
              style: 'default',
              onPress: () => {},
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSignUp = async () => {
    if (validateForm()) {
      try {
        setCreating(true);
        await signUp(email, password);
      } catch (error) {
        // Alert.alert('Error', error.message);
        showAlert({
          type: 'error',
          title: 'Error',
          message: error.message,
          buttons: [
            {
              text: 'OK',
              style: 'default',
              onPress: () => {},
            },
          ],
        });
      } finally {
        setCreating(false);
        navigation.replace('UserDetails');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome to FitAI!</Text>
          <Text style={styles.subtitle}>
            Sign in to continue your fitness journey
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Icon
              name="email-outline"
              size={20}
              color={theme.colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholderTextColor={theme.colors.textSecondary}
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
              color={theme.colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, {flex: 1}]}
              placeholderTextColor={theme.colors.textSecondary}
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
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}>
            <Text style={styles.loginButtonText}>
              {' '}
              {loading ? 'Loading...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('SignupScreen')}>
            <Text style={styles.loginLinkText}>
              Don't have an account?{' '}
              <Text style={styles.loginText}>Sign UP</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
