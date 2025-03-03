import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

const {width} = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to FitAI',
    description: 'Your journey to a healthier lifestyle starts here',
    image: require('../assets/onboarding/welcome.jpg'),
    backgroundColor: ['#4158D0', '#C850C0'],
  },
  {
    id: '2',
    title: 'Smart Workouts',
    description: 'Personalized AI-powered routines that adapt to your progress',
    image: require('../assets/onboarding/workout.jpg'),
    backgroundColor: ['#0093E9', '#80D0C7'],
  },
  {
    id: '3',
    title: 'Track Progress',
    description:
      'Watch your transformation with advanced analytics and insights',
    image: require('../assets/onboarding/progress.jpg'),
    backgroundColor: ['#8EC5FC', '#E0C3FC'],
  },
];

const OnboardingScreen = ({navigation}) => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const {theme} = useTheme();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  if (!fontsLoaded) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    slideContainer: {
      width: width,
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageContainer: {
      width: width * 0.8,
      height: width * 0.8,
      marginBottom: 40,
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 10},
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    contentContainer: {
      width: width * 0.9,
      padding: 20,
      borderRadius: 25,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 5},
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },
    title: {
      fontSize: 32,
      fontFamily: 'Poppins_700Bold',
      color: theme.colors.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    description: {
      fontSize: 16,
      fontFamily: 'Poppins_400Regular',
      color: theme.colors.text,
      textAlign: 'center',
      paddingHorizontal: 20,
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
      position: 'absolute',
      bottom: 50,
      width: width - 60,
      marginHorizontal: 30,
      overflow: 'hidden',
      borderRadius: 15,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 5},
      shadowOpacity: 0.2,
      shadowRadius: 5,
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
  });

  const handleScroll = event => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x /
        event.nativeEvent.layoutMeasurement.width,
    );
    setActiveSlideIndex(slideIndex);
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.replace('Login');
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

      <TouchableOpacity style={styles.button} onPress={completeOnboarding}>
        <LinearGradient
          colors={['#FF416C', '#FF4B2B']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.buttonGradient}>
          <Text style={styles.buttonText}>
            {activeSlideIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default OnboardingScreen;
