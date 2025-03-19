import React, {useState, useEffect} from 'react';
import {FloatingChatButton} from '../components/FloatingChatButton';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';

import {Text} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {supabase} from '../lib/supabase';
import axios from 'axios';

import LinearGradient from 'react-native-linear-gradient';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

// Helper function to estimate calories based on duration and exercise type
const calculateEstimatedCalories = (
  durationMinutes: number,
  exerciseType: string,
): number => {
  const MET = {
    walking: 3.5,
    running: 8,
    cycling: 7.5,
    swimming: 6,
    weightlifting: 3.5,
    yoga: 2.5,
    hiit: 8,
    default: 4,
  } as const;

  const averageWeight = 70;
  const exerciseTypeKey =
    exerciseType?.toLowerCase().replace(/\s+/g, '') || 'default';
  const met = MET[exerciseTypeKey as keyof typeof MET] || MET.default;
  const hours = durationMinutes / 60;

  return Math.round(met * averageWeight * hours);
};

type WorkoutData = {
  id: string;
  user_id: string;
  date: string;
  calories: number;
  duration: number;
  workout_type: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

interface Exercise {
  id: string;
  name: string;
  target: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  instructions?: string[];
}

type Profile = {
  full_name?: string;
};

const LoadingPlaceholder = ({theme}: {theme: any}) => {
  return (
    <View style={{padding: theme.spacing.m}}>
      <View
        style={{
          height: 100,
          backgroundColor: theme.colors.card,
          marginVertical: theme.spacing.s,
          borderRadius: theme.borderRadii.m,
        }}
      />
      <View
        style={{
          height: 100,
          backgroundColor: theme.colors.card,
          marginVertical: theme.spacing.s,
          borderRadius: theme.borderRadii.m,
        }}
      />
      <View
        style={{
          height: 100,
          backgroundColor: theme.colors.card,
          marginVertical: theme.spacing.s,
          borderRadius: theme.borderRadii.m,
        }}
      />
    </View>
  );
};

const HomeScreen = () => {
  const {theme} = useTheme();
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState({
    calories: 0,
    duration: 0,
    workouts: 0,
  });
  const [selectedBodyPart, setSelectedBodyPart] = useState('chest');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>({});
  const shimmerValue = new Animated.Value(0);

  const bodyParts = [
    'chest',
    'back',
    'cardio',
    'lower arms',
    'lower legs',
    'neck',
    'shoulders',
    'upper arms',
    'upper legs',
    'waist',
  ];

  useEffect(() => {
    fetchExercises(selectedBodyPart);
  }, [selectedBodyPart]);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      shimmerValue.setValue(0);
    }
  }, [loading]);

  // useEffect(() => {
  //   fetchWorkoutData();
  // }, []);

  const calculateMonthlyStats = (workouts: WorkoutData[]) => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= monthStart;
    });

    return {
      workouts: monthWorkouts.length,
      calories: monthWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0),
      duration: monthWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
    };
  };

  const fetchWorkoutData = async () => {
    try {
      const {
        data: {user},
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      // Fetch from both tables
      const [workoutsResponse, exerciseTrackingResponse] = await Promise.all([
        supabase.from('workouts').select('*').eq('user_id', user.id),
        supabase.from('exercise_tracking').select('*').eq('user_id', user.id),
      ]);

      if (workoutsResponse.error) {
        console.error('Workouts fetch error:', workoutsResponse.error);
      }

      if (exerciseTrackingResponse.error) {
        console.error(
          'Exercise tracking fetch error:',
          exerciseTrackingResponse.error,
        );
      }

      // Combine and normalize data from both sources
      const combinedWorkouts = [
        ...(workoutsResponse.data || []).map(w => ({
          id: w.id,
          user_id: w.user_id,
          date: w.date,
          calories: w.calories || 0,
          duration: w.duration || 0,
          workout_type: w.workout_type,
          notes: w.notes,
          created_at: w.created_at,
          updated_at: w.updated_at,
        })),
        ...(exerciseTrackingResponse.data || []).map(e => ({
          id: e.id,
          user_id: e.user_id,
          date: e.completed_at || e.created_at, // Use completed_at if available
          calories: calculateEstimatedCalories(
            e.duration_minutes,
            e.exercise_name,
          ), // Helper function to estimate calories
          duration: e.duration_minutes || 0,
          workout_type: e.exercise_name,
          notes: `${e.target_muscle || ''} ${e.equipment_used || ''} ${
            e.body_part || ''
          }`.trim(),
          created_at: e.created_at,
          updated_at: e.updated_at,
        })),
      ];
      console.log('combinedWorkouts===', combinedWorkouts);

      if (combinedWorkouts.length === 0) {
        console.log('No workout data found for user:', user.id);

        setStats({
          workouts: 0,
          calories: 0,
          duration: 0,
          // streak: 0,
        });
        return;
      }

      // Process the combined data

      const monthlyStats = calculateMonthlyStats(combinedWorkouts);

      // Update state
      console.log('monthlyStats==', monthlyStats);

      setStats(monthlyStats);
    } catch (e) {
      console.error('Error in fetchWorkoutData:', e);
    } finally {
    }
  };

  const fetchExercises = async (bodyPart: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}?limit=10&offset=0`,
        {
          headers: {
            'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
            'x-rapidapi-key':
              '106d741645msh732ba7755e20db3p15d816jsn472b6c0e1169',
          },
        },
      );
      setExercises(response.data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
    },

    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.m,
    },
    welcomeCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadii.m,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
    },
    welcomeText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.s,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.m,
    },
    statCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadii.m,
      padding: theme.spacing.m,
      flex: 1,
      marginHorizontal: theme.spacing.xs,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginTop: theme.spacing.xs,
    },
    statLabel: {
      fontSize: 14,
      color: theme.colors.text,
      marginTop: theme.spacing.xs,
    },
    quickActionCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadii.m,
      padding: theme.spacing.m,
      marginTop: theme.spacing.m,
      flexDirection: 'row',
      alignItems: 'center',
    },
    quickActionText: {
      marginLeft: theme.spacing.m,
      flex: 1,
      color: theme.colors.text,
    },
    listContainer: {
      marginTop: theme.spacing.m,
    },
    bodyPartItem: {
      padding: theme.spacing.m,
      marginRight: theme.spacing.s,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadii.m,
      minWidth: 100,
      alignItems: 'center',
    },
    bodyPartItemSelected: {
      backgroundColor: theme.colors.primary,
    },
    bodyPartText: {
      color: theme.colors.text,
      fontWeight: '500',
    },
    bodyPartTextSelected: {
      color: '#fff',
    },
    exerciseCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadii.m,
      padding: theme.spacing.m,
      marginRight: theme.spacing.m,
      width: 280,
    },
    exerciseImage: {
      width: '100%',
      height: 200,
      borderRadius: theme.borderRadii.s,
      marginBottom: theme.spacing.s,
    },
    exerciseName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    exerciseTarget: {
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.8,
    },
    loadingCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadii.m,
      padding: theme.spacing.m,
      marginRight: theme.spacing.m,
      width: 280,
      opacity: 0.7,
    },
    loadingImage: {
      width: '100%',
      height: 200,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadii.s,
      marginBottom: theme.spacing.s,
    },
    loadingText: {
      height: 20,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadii.s,
      marginBottom: theme.spacing.xs,
      width: '80%',
    },
    loadingTextSmall: {
      height: 16,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadii.s,
      width: '60%',
    },
  });

  const fetchProfile = async () => {
    try {
      const {
        data: {user: currentUser},
      } = await supabase.auth.getUser();

      if (!currentUser) {
        console.log('No user found');
        return;
      }

      const {data, error} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        return;
      }

      if (data) {
        console.log('Profile data:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      // Alert.alert('Error', 'Failed to load profile data');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const initializeData = async () => {
        fetchProfile();
        await fetchWorkoutData();
      };

      initializeData();

      // Optional: Return a cleanup function if needed
      return () => {
        // Any cleanup code if necessary
      };
    }, []), // Empty dependency array since we want this to run on every focus
  );

  console.log('profile====', profile);

  const renderBodyPart = ({item}: {item: string}) => (
    <TouchableOpacity
      onPress={() => setSelectedBodyPart(item)}
      style={[
        styles.bodyPartItem,
        selectedBodyPart === item && styles.bodyPartItemSelected,
      ]}>
      <Text
        style={[
          styles.bodyPartText,
          selectedBodyPart === item && styles.bodyPartTextSelected,
        ]}>
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const renderLoadingCard = () => {
    const opacity = shimmerValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    });

    return (
      <Animated.View style={[styles.loadingCard, {opacity}]}>
        <View style={styles.loadingImage} />
        <View style={styles.loadingText} />
        <View style={styles.loadingTextSmall} />
      </Animated.View>
    );
  };

  const renderLoadingList = () => (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={[1, 2, 3]}
      renderItem={renderLoadingCard}
      keyExtractor={item => item.toString()}
    />
  );

  const handleExercisePress = (exercise: Exercise) => {
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

  const renderExercise = ({item}: {item: Exercise}) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => handleExercisePress(item)}
      activeOpacity={0.7}>
      <Image
        source={{uri: item.gifUrl}}
        style={styles.exerciseImage}
        resizeMode="cover"
      />
      <Text style={styles.exerciseName}>{item.name}</Text>
      <Text style={styles.exerciseTarget}>Target: {item.target}</Text>
    </TouchableOpacity>
  );
  const screenTitle = profile?.full_name
    ? `Welcome back, ${profile?.full_name?.split(' ')[0]}!`
    : 'Welcome back!';
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeText}>{screenTitle}</Text>
            <Text style={{color: theme.colors.text}}>
              Ready for today's workout?
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.calories}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.duration}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.workouts}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
          </View>

          <View style={styles.listContainer}>
            <Text style={[styles.welcomeText, {fontSize: 20}]}>
              What’s Your Fitness Goal Today?
            </Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={bodyParts}
              renderItem={renderBodyPart}
              keyExtractor={item => item}
              style={{marginVertical: theme.spacing.s}}
            />
          </View>

          <View style={styles.listContainer}>
            <Text style={[styles.welcomeText, {fontSize: 20}]}>Exercises</Text>
            {loading ? (
              renderLoadingList()
            ) : (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={exercises}
                renderItem={renderExercise}
                keyExtractor={item => item.id}
                style={{marginVertical: theme.spacing.s}}
              />
            )}
          </View>
        </View>
      </ScrollView>
      <FloatingChatButton />
    </View>
  );
};

export default HomeScreen;
