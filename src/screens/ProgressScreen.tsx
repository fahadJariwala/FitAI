import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {Text} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {supabase} from '../lib/supabase';
import {useFocusEffect} from '@react-navigation/native';

interface WorkoutData {
  id: string;
  user_id: string;
  date: string;
  calories: number;
  duration: number;
  workout_type?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const SkeletonLoader = ({theme, width, height, style}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: theme.colors.card,
          opacity,
          borderRadius: theme.borderRadii.m,
        },
        style,
      ]}
    />
  );
};

const ProgressScreen = () => {
  const {theme} = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeklyData, setWeeklyData] = useState({
    labels: [],
    datasets: [{data: []}],
  });
  const [monthlyProgress, setMonthlyProgress] = useState({
    workouts: 0,
    calories: 0,
    duration: 0,
    streak: 0,
  });

  const checkDatabaseSetup = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check authentication first
      const {
        data: {user},
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error('Auth error:', authError);
        setError('Authentication error. Please login again.');
        return false;
      }

      if (!user) {
        setError('No user logged in');
        return false;
      }

      // Test query to check table access
      const {data, error: queryError} = await supabase
        .from('workouts')
        .select('id')
        .limit(1);

      if (queryError) {
        console.error('Database error:', queryError);

        if (queryError.code === '42P01') {
          setError('Workout table not found. Please contact support.');
        } else {
          setError(`Database error: ${queryError.message}`);
        }
        return false;
      }

      return true;
    } catch (e) {
      console.error('Setup check failed:', e);
      setError('Failed to verify database setup');
      return false;
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const initializeData = async () => {
        setIsLoading(true);
        const isSetupValid = await checkDatabaseSetup();
        if (isSetupValid) {
          await fetchWorkoutData();
        }
        setIsLoading(false);
      };

      initializeData();

      // Optional: Return a cleanup function if needed
      return () => {
        // Any cleanup code if necessary
      };
    }, []), // Empty dependency array since we want this to run on every focus
  );

  const fetchWorkoutData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        data: {user},
      } = await supabase.auth.getUser();

      if (!user) {
        setError('No user logged in');
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

      if (combinedWorkouts.length === 0) {
        console.log('No workout data found for user:', user.id);
        setWeeklyData({
          labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          datasets: [{data: [0, 0, 0, 0, 0, 0, 0]}],
        });
        setMonthlyProgress({
          workouts: 0,
          calories: 0,
          duration: 0,
          streak: 0,
        });
        return;
      }

      // Process the combined data
      const processedData = processWorkoutData(combinedWorkouts);
      const monthlyStats = calculateMonthlyStats(combinedWorkouts);

      // Update state
      setWeeklyData(processedData);
      setMonthlyProgress(monthlyStats);
    } catch (e) {
      console.error('Error in fetchWorkoutData:', e);
      setError('Failed to load workout data');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.m,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: theme.spacing.l,
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xl,
    },
    statCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadii.l,
      padding: theme.spacing.m,
      width: '48%',
      marginBottom: theme.spacing.m,
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    statValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    statLabel: {
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.8,
    },
    chartContainer: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadii.l,
      padding: theme.spacing.l,
      marginBottom: theme.spacing.xl,
      elevation: 2,
      shadowColor: theme.colors.shadow,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.m,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 400,
    },
    noDataContainer: {
      height: 220,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: 16,
    },
    noDataText: {
      fontSize: 16,
      color: theme.colors.text,
      opacity: 0.7,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      color: 'red',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.colors.text,
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      padding: 12,
      borderRadius: 8,
      marginTop: 10,
    },
    retryText: {
      color: 'white',
      fontSize: 16,
    },
    debugContainer: {
      padding: 10,
      backgroundColor: '#f0f0f0',
      marginBottom: 10,
      borderRadius: 8,
    },
    debugText: {
      fontSize: 12,
      color: '#333',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      marginBottom: 5,
    },
    skeleton: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadii.m,
    },
  });

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={checkDatabaseSetup}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Monthly Progress</Text>
          <View style={styles.statsContainer}>
            {[1, 2, 3, 4].map((_, index) => (
              <View key={index} style={styles.statCard}>
                <SkeletonLoader
                  theme={theme}
                  width={80}
                  height={30}
                  style={{marginBottom: 8}}
                />
                <SkeletonLoader theme={theme} width={60} height={20} />
              </View>
            ))}
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Weekly Activity</Text>
            <SkeletonLoader
              theme={theme}
              width={screenWidth - 2 * theme.spacing.m - 2 * theme.spacing.m}
              height={220}
            />
          </View>
        </View>
      </ScrollView>
    );
  }

  console.log('monthlyProgress====', monthlyProgress);

  const renderDebugInfo = () => {
    // if (__DEV__) {
    //   return (
    //     <View style={styles.debugContainer}>
    //       <Text style={styles.debugText}>
    //         Monthly Progress: {'\n'}
    //         Workouts: {monthlyProgress.workouts}
    //         {'\n'}
    //         Calories: {monthlyProgress.calories}
    //         {'\n'}
    //         Duration: {monthlyProgress.duration}
    //         {'\n'}
    //         Streak: {monthlyProgress.streak}
    //       </Text>
    //       <Text style={styles.debugText}>
    //         Weekly Data: {'\n'}
    //         Labels: {weeklyData.labels.join(', ')}
    //         {'\n'}
    //         Data: {weeklyData.datasets[0].data.join(', ')}
    //       </Text>
    //     </View>
    //   );
    // }
    return null;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {renderDebugInfo()}
        <Text style={styles.sectionTitle}>Monthly Progress</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{monthlyProgress.workouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{monthlyProgress.calories}</Text>
            <Text style={styles.statLabel}>Calories Burned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {Math.floor(monthlyProgress.duration / 60)}h{' '}
              {monthlyProgress.duration % 60}m
            </Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{monthlyProgress.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Weekly Activity</Text>
          {weeklyData.datasets[0].data.length > 0 ? (
            <LineChart
              data={weeklyData}
              width={screenWidth - 2 * theme.spacing.m - 2 * theme.spacing.m}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.card,
                backgroundGradientFrom: theme.colors.card,
                backgroundGradientTo: theme.colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => theme.colors.primary,
                labelColor: (opacity = 1) => theme.colors.text,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: theme.colors.primary,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No workout data available</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const processWorkoutData = (workouts: WorkoutData[]) => {
  console.log('Processing workouts:', workouts); // Debug log

  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data = new Array(7).fill(0);

  // Get current date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  workouts.forEach(workout => {
    const workoutDate = new Date(workout.date);
    workoutDate.setHours(0, 0, 0, 0);

    // Calculate days ago
    const diffTime = today.getTime() - workoutDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    console.log('Workout date:', workoutDate, 'Days ago:', diffDays); // Debug log

    if (diffDays >= 0 && diffDays < 7) {
      data[6 - diffDays] += workout.calories;
    }
  });

  console.log('Processed data:', {labels, data}); // Debug log

  return {
    labels,
    datasets: [
      {
        data,
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
      },
    ],
  };
};

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
    streak: calculateStreak(workouts),
  };
};

// Improved streak calculation
const calculateStreak = (workouts: WorkoutData[]) => {
  if (!workouts || workouts.length === 0) return 0;

  // Sort workouts by date in descending order
  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Get unique dates
  const uniqueDates = Array.from(
    new Set(sortedWorkouts.map(w => new Date(w.date).toDateString())),
  );

  console.log('Unique workout dates:', uniqueDates);

  let streak = 1;
  const today = new Date().toDateString();
  let currentDate = new Date(uniqueDates[0]);

  // If the most recent workout is not from today, check if it was yesterday
  if (currentDate.toDateString() !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (currentDate.toDateString() !== yesterday.toDateString()) {
      return 0;
    }
  }

  // Count consecutive days
  for (let i = 1; i < uniqueDates.length; i++) {
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);

    if (
      new Date(uniqueDates[i]).toDateString() === previousDate.toDateString()
    ) {
      streak++;
      currentDate = previousDate;
    } else {
      break;
    }
  }

  console.log('Calculated streak:', streak);
  return streak;
};

const addWorkout = async (workoutData: {
  calories: number;
  duration: number;
  workout_type: string;
  notes?: string;
}) => {
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return;

  const {data, error} = await supabase.from('workouts').insert([
    {
      user_id: user.id,
      date: new Date().toISOString(),
      ...workoutData,
    },
  ]);

  console.log('Workout added:', {data, error});
  return {data, error};
};

// Add this helper function to estimate calories based on duration and exercise type
const calculateEstimatedCalories = (
  durationMinutes: number,
  exerciseType: string,
): number => {
  // These are rough estimates and should be adjusted based on your needs
  const MET = {
    walking: 3.5,
    running: 8,
    cycling: 7.5,
    swimming: 6,
    weightlifting: 3.5,
    yoga: 2.5,
    hiit: 8,
    default: 4, // default MET value for unknown exercises
  };

  // Average weight in kg (you might want to make this user-specific)
  const averageWeight = 70;

  // Calculate calories using the MET formula
  // Calories = MET × Weight (kg) × Duration (hours)
  const exerciseTypeKey =
    exerciseType?.toLowerCase().replace(/\s+/g, '') || 'default';
  const met = MET[exerciseTypeKey] || MET.default;
  const hours = durationMinutes / 60;

  return Math.round(met * averageWeight * hours);
};

export default ProgressScreen;
