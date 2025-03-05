import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
  Text,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { typography } from '../styles/typeograpghy';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to FitAI',
    description: 'Your journey to a healthier lifestyle starts here',
    image: require('../assets/images/feature1.jpg'),
    backgroundColor: ['#FF4B4B', '#FFFFFF'],
  },
  {
    id: '2',
    title: 'Smart Workouts',
    description: 'Personalized AI-powered routines that adapt to your progress',
    image: require('../assets/images/feature2.jpg'),
    backgroundColor: ['#FF4B4B', '#FFFFFF'],
  },
  {
    id: '3',
    title: 'Track Progress',
    description:
      'Watch your transformation with advanced analytics and insights',
    image: require('../assets/images/feature3.jpg'),
    backgroundColor: ['#FF4B4B', '#FFFFFF'],
  },
];

const OnboardingScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      width: width,
      height: height,
      padding: 0,
      margin: 0,
    },
    slideContainer: {
      width: width,
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageContainer: {
      marginTop: 80,
      width: width * 0.8,
      height: width * 0.8,
      marginBottom: 40,

      overflow: 'hidden',
      // elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    image: {
      width: width * 0.8,
      height: height * 0.4,
      resizeMode: 'cover',
      borderRadius: 20,
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    title: {
      ...typography.h2,
      marginBottom: 20,
    },
    subtitle: {
      ...typography.h4,
      marginBottom: 16,
    },
    description: {
      ...typography.bodyLarge,
      marginBottom: 24,
    },
    paginationContainer: {
      flexDirection: 'row',
      position: 'absolute',
      bottom: 150,
      alignSelf: 'center',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      marginHorizontal: 5,
      transition: '0.3s',
    },
    activeDot: {
      width: 20,
      backgroundColor: '#fff',
    },
    button: {
      ...typography.button,
      padding: 12,
    },
    buttonGradient: {
      paddingVertical: 15,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontFamily: 'Poppins_600SemiBold',
    },
    skipText: {
      ...typography.bodyMedium,
      color: '#666',
    },
  });

  const handleScroll = event => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x /
      event.nativeEvent.layoutMeasurement.width,
    );
    setActiveSlideIndex(slideIndex);
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasLaunched', 'true');
      navigation.replace('MainApp');
    } catch (error) {
      console.error('Error saving first launch status:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {slides.map((slide, index) => (
          <LinearGradient
            key={slide.id}
            colors={slide.backgroundColor}
            style={styles.slideContainer}>
            <View style={styles.imageContainer}>
              <ImageBackground source={slide.image} style={styles.image} />
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </LinearGradient>
        ))}
      </ScrollView>

      <View style={styles.paginationContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === activeSlideIndex && styles.activeDot]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OnboardingScreen;
