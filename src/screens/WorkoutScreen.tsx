import React, {useState} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {Text} from 'react-native';

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
  const {theme} = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('All');

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
    },
    workoutImage: {
      width: '100%',
      height: 150,
      backgroundColor: theme.colors.border,
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
    },
    workoutInfoText: {
      color: theme.colors.text,
      marginLeft: theme.spacing.xs,
    },
  });

  const filteredWorkouts =
    selectedCategory === 'All'
      ? workouts
      : workouts.filter(workout => workout.category === selectedCategory);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category &&
                    styles.categoryButtonSelected,
                ]}
                onPress={() => setSelectedCategory(category)}>
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category &&
                      styles.categoryTextSelected,
                  ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {filteredWorkouts.map(workout => (
          <TouchableOpacity key={workout.id} style={styles.workoutCard}>
            <View style={styles.workoutImage} />
            <View style={styles.workoutContent}>
              <Text style={styles.workoutTitle}>{workout.name}</Text>
              <View style={styles.workoutDetails}>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutInfoText}>{workout.duration}</Text>
                </View>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutInfoText}>
                    {workout.difficulty}
                  </Text>
                </View>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutInfoText}>
                    {workout.calories} cal
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
