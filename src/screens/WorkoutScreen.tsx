import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

// API configuration
const API_CONFIG = {
  headers: {
    'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
    'x-rapidapi-key': '106d741645msh732ba7755e20db3p15d816jsn472b6c0e1169',
  },
};

const categories = ['All', 'Strength', 'Cardio', 'Flexibility', 'HIIT'];

const workouts = [
  {
    id: '1',
    name: 'Full Body Workout',
    duration: '45 min',
    difficulty: 'Intermediate',
    calories: '400',
    category: 'Strength',
  },
  {
    id: '2',
    name: 'HIIT Cardio',
    duration: '30 min',
    difficulty: 'Advanced',
    calories: '350',
    category: 'HIIT',
  },
  {
    id: '3',
    name: 'Yoga Flow',
    duration: '60 min',
    difficulty: 'Beginner',
    calories: '200',
    category: 'Flexibility',
  },
];

const WorkoutScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories (targets) from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          'https://exercisedb.p.rapidapi.com/exercises/targetList',
          { headers: API_CONFIG.headers },
        );
        // const data = await response.json();
        const data = [
          'abductors',
          'abs',
          'adductors',
          'biceps',
          'calves',
          'cardiovascular system',
          'delts',
          'forearms',
          'glutes',
          'hamstrings',
          'lats',
          'levator scapulae',
          'pectorals',
          'quads',
          'serratus anterior',
          'spine',
          'traps',
          'triceps',
          'upper back',
        ];
        setCategories(['All', ...data]);
        setSelectedCategory('All');
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch workouts based on selected category
  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      try {
        let url = 'https://exercisedb.p.rapidapi.com/exercises';
        if (selectedCategory && selectedCategory !== 'All') {
          url = `https://exercisedb.p.rapidapi.com/exercises/target/${selectedCategory.toLowerCase()}`;
        }
        url += '?limit=10&offset=0';

        const response = await fetch(url, { headers: API_CONFIG.headers });
        const data = await response.json();
        setWorkouts(data);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCategory) {
      fetchWorkouts();
    }
  }, [selectedCategory]);

  const handleExercisePress = exercise => {
    navigation.navigate('ExerciseDetail', {
      exercise: {
        ...exercise,
        instructions: exercise.instructions || [
          'Keep your back straight',
          'Breathe steadily throughout the exercise',
          'Maintain proper form',
        ], // Fallback instructions if API doesn't provide them
      },
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.m,
    },
    categoriesContainer: {
      marginBottom: theme.spacing.m,
    },
    categoryScroll: {
      flexDirection: 'row',
      paddingVertical: theme.spacing.s,
    },
    categoryButton: {
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.s,
      marginRight: theme.spacing.s,
      borderRadius: theme.borderRadii.m,
      backgroundColor: theme.colors.card,
    },
    categoryButtonSelected: {
      backgroundColor: theme.colors.primary,
    },
    categoryText: {
      color: theme.colors.text,
    },
    categoryTextSelected: {
      color: '#FFFFFF',
    },
    workoutCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadii.m,
      marginBottom: theme.spacing.m,
      overflow: 'hidden',
      elevation: 3, // Android shadow
      shadowColor: '#000', // iOS shadow
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    workoutImage: {
      width: '100%',
      height: 200,
      resizeMode: 'cover',
    },
    workoutContent: {
      padding: theme.spacing.m,
    },
    workoutTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.s,
    },
    workoutDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.s,
    },
    workoutInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.s,
      paddingVertical: 4,
      borderRadius: theme.borderRadii.s,
    },
    workoutInfoText: {
      color: theme.colors.text,
      fontSize: 14,
    },
  });

  // Add loading styles
  const updatedStyles = StyleSheet.create({
    ...styles,
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.m,
    },
    loadingCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadii.m,
      marginBottom: theme.spacing.m,
      overflow: 'hidden',
      elevation: 3,
      height: 300, // Adjust based on your card height
    },
    shimmer: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.colors.card,
      opacity: 0.5,
    },
  });

  const renderLoadingCards = () => {
    return Array(3)
      .fill(null)
      .map((_, index) => (
        <Animated.View
          key={index}
          style={[
            updatedStyles.loadingCard,
            {
              opacity: loading ? 0.5 : 1,
            },
          ]}>
          <View style={updatedStyles.shimmer} />
        </Animated.View>
      ));
  };

  return (
    <ScrollView style={updatedStyles.container}>
      <View style={updatedStyles.content}>
        <View style={updatedStyles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={updatedStyles.categoryScroll}>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  updatedStyles.categoryButton,
                  selectedCategory === category &&
                  updatedStyles.categoryButtonSelected,
                ]}
                onPress={() => setSelectedCategory(category)}>
                <Text
                  style={[
                    updatedStyles.categoryText,
                    selectedCategory === category &&
                    updatedStyles.categoryTextSelected,
                  ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading
          ? renderLoadingCards()
          : workouts.map(workout => (
            <TouchableOpacity
              key={workout.id}
              style={updatedStyles.workoutCard}
              onPress={() => handleExercisePress(workout)}
              activeOpacity={0.7}>
              <Image
                source={{ uri: workout.gifUrl }}
                style={updatedStyles.workoutImage}
              />
              <View style={updatedStyles.workoutContent}>
                <Text style={updatedStyles.workoutTitle}>{workout.name}</Text>
                <View style={updatedStyles.workoutDetails}>
                  <View style={updatedStyles.workoutInfo}>
                    {/* <Icon
                      name="body-part"
                      size={16}
                      color={theme.colors.text}
                      style={{ marginRight: 4 }}
                    /> */}
                    <Text style={updatedStyles.workoutInfoText}>
                      Target: {workout.target}
                    </Text>
                  </View>
                  <View style={updatedStyles.workoutInfo}>
                    {/* <Icon
                      name="dumbbell"
                      size={16}
                      color={theme.colors.text}
                      style={{ marginRight: 4 }}
                    /> */}
                    <Text style={updatedStyles.workoutInfoText}>
                      Equipment: {workout.equipment}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
      </View>
    </ScrollView>
  );
};

export default WorkoutScreen;
