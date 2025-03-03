import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Text} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from '../config/supabase';
import {useAuth} from '../context/AuthContext';

const UserDetailsScreen = ({navigation, route}) => {
  const {theme} = useTheme();
  const {user} = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    fitnessGoal: '',
  });

  const fitnessGoals = [
    'Weight Loss',
    'Muscle Gain',
    'General Fitness',
    'Sports Performance',
    'Flexibility',
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || formData.age < 13 || formData.age > 100) {
      newErrors.age = 'Please enter a valid age (13-100)';
    }

    if (!formData.weight) {
      newErrors.weight = 'Weight is required';
    } else if (
      isNaN(formData.weight) ||
      formData.weight < 30 ||
      formData.weight > 300
    ) {
      newErrors.weight = 'Please enter a valid weight (30-300 kg)';
    }

    if (!formData.height) {
      newErrors.height = 'Height is required';
    } else if (
      isNaN(formData.height) ||
      formData.height < 100 ||
      formData.height > 250
    ) {
      newErrors.height = 'Please enter a valid height (100-250 cm)';
    }

    if (!formData.fitnessGoal) {
      newErrors.fitnessGoal = 'Please select a fitness goal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveToSupabase = async () => {
    try {
      const {data, error} = await supabase.from('user_details').upsert({
        user_id: user.id,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseInt(formData.height),
        fitness_goal: formData.fitnessGoal,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      throw error;
    }
  };

  const saveToLocalStorage = async () => {
    try {
      await AsyncStorage.setItem('userDetails', JSON.stringify(formData));
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        'Validation Error',
        'Please correct the errors before submitting.',
      );
      return;
    }

    setLoading(true);
    try {
      await Promise.all([saveToSupabase(), saveToLocalStorage()]);

      Alert.alert('Success', 'Your profile has been updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save your profile. Please try again.', [
        {text: 'OK'},
      ]);
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    input: {
      backgroundColor: theme.colors.card,
      borderRadius: 10,
      padding: 15,
      marginBottom: 5,
      fontSize: 16,
      fontFamily: 'Poppins_400Regular',
      borderWidth: 1,
      borderColor:
        errors.age || errors.weight || errors.height ? 'red' : 'transparent',
    },
    label: {
      fontSize: 16,
      fontFamily: 'Poppins_600SemiBold',
      marginBottom: 5,
      color: theme.colors.text,
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginBottom: 10,
      fontFamily: 'Poppins_400Regular',
    },
    goalsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 20,
    },
    goalButton: {
      padding: 10,
      borderRadius: 20,
      margin: 5,
      backgroundColor: theme.colors.card,
    },
    selectedGoal: {
      backgroundColor: theme.colors.primary,
    },
    goalText: {
      color: theme.colors.text,
      fontFamily: 'Poppins_400Regular',
    },
    selectedGoalText: {
      color: '#FFFFFF',
    },
    submitButton: {
      marginTop: 20,
      borderRadius: 10,
      overflow: 'hidden',
    },
    submitButtonGradient: {
      padding: 15,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontFamily: 'Poppins_600SemiBold',
      marginLeft: 10,
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <ScrollView style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        value={formData.age}
        onChangeText={text => {
          setFormData({...formData, age: text});
          setErrors({...errors, age: null});
        }}
        placeholder="Enter your age"
        keyboardType="numeric"
      />
      {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        value={formData.weight}
        onChangeText={text => {
          setFormData({...formData, weight: text});
          setErrors({...errors, weight: null});
        }}
        placeholder="Enter your weight"
        keyboardType="numeric"
      />
      {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}

      <Text style={styles.label}>Height (cm)</Text>
      <TextInput
        style={styles.input}
        value={formData.height}
        onChangeText={text => {
          setFormData({...formData, height: text});
          setErrors({...errors, height: null});
        }}
        placeholder="Enter your height"
        keyboardType="numeric"
      />
      {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}

      <Text style={styles.label}>Fitness Goal</Text>
      <View style={styles.goalsContainer}>
        {fitnessGoals.map(goal => (
          <TouchableOpacity
            key={goal}
            style={[
              styles.goalButton,
              formData.fitnessGoal === goal && styles.selectedGoal,
            ]}
            onPress={() => {
              setFormData({...formData, fitnessGoal: goal});
              setErrors({...errors, fitnessGoal: null});
            }}>
            <Text
              style={[
                styles.goalText,
                formData.fitnessGoal === goal && styles.selectedGoalText,
              ]}>
              {goal}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.fitnessGoal && (
        <Text style={styles.errorText}>{errors.fitnessGoal}</Text>
      )}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}>
        <LinearGradient
          colors={['#FF416C', '#FF4B2B']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.submitButtonGradient}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Complete Profile</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default UserDetailsScreen;
