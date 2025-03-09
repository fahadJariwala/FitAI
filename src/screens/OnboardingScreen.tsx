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
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native';
import { useColorScheme } from 'react-native';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to FitAI',
    description: 'Your journey to a healthier lifestyle starts here',
    image: require('../assets/images/onboard1.png'),
    backgroundColor: ['theme.colors.background', 'theme.colors.background'],
  },
  {
    id: '2',
    title: 'Smart Workouts',
    description: 'Personalized AI-powered routines that adapt to your progress',
    image: require('../assets/images/onboard2.png'),
    backgroundColor: ['#FFF', '#FFFFFF'],
  },
  {
    id: '3',
    title: 'Track Progress',
    description:
      'Watch your transformation with advanced analytics and insights',
    image: require('../assets/images/onboard3.png'),
    backgroundColor: ['#FFF', '#FFFFFF'],
  },
];

const OnboardingScreen = ({ navigation, onDone }) => {
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
      backgroundColor: theme.colors.background,
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
      color: theme.colors.text,
    },
    subtitle: {
      ...typography.h4,
      marginBottom: 16,
      color: theme.colors.text,
    },
    description: {
      ...typography.bodyLarge,
      marginBottom: 24,
      color: theme.colors.text,
      textAlign: 'center',
      opacity: 0.8,
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
      backgroundColor: theme.colors.inputPlaceholder,
      marginHorizontal: 5,
      transition: '0.3s',
      opacity: 0.5,
    },
    activeDot: {
      width: 20,
      backgroundColor: theme.colors.primary,
      opacity: 1,
    },
    button: {
      ...typography.button,
      padding: 12,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      paddingHorizontal: 20,
      alignSelf: 'center',
      borderRadius: 20
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
    slideContent: {
      backgroundColor: theme.colors.background,
    },
    text: {
      color: theme.colors.text,
    },
    startButton: {
      ...typography.button,
      padding: 12,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      paddingHorizontal: 20,


    },
  }
  );

  const handleScroll = event => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x /
      event.nativeEvent.layoutMeasurement.width,
    );
    setActiveSlideIndex(slideIndex);
  };

  const handleGetStarted = () => {
    onDone();
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
          <View
            key={slide.id}
            // colors={slide.backgroundColor}
            style={styles.slideContainer}>
            <View style={styles.imageContainer}>
              <ImageBackground source={slide.image} style={styles.image} />
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </View>
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


      <TouchableOpacity style={styles.startButton} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

    </View>
  );
};

export default OnboardingScreen;
