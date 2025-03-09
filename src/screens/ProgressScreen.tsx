import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '../lib/supabase';

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

const ProgressScreen = () => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeklyData, setWeeklyData] = useState({
    labels: [],
    datasets: [{ data: [] }],
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
      const { data: { user }, error: authError } = await supabase.auth.getUser();

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
      const { data, error: queryError } = await supabase
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

  useEffect(() => {
    const initializeData = async () => {
      const isSetupValid = await checkDatabaseSetup();
      if (isSetupValid) {
        await fetchWorkoutData();
      }
      setIsLoading(false);
    };

    initializeData();
  }, []);

  const fetchWorkoutData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user ID:', user?.id); // Debug log

      if (!user) {
        setError('No user logged in');
        return;
      }

      // 2. Fetch workouts without date filter first to debug
      const { data: workouts, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id);

      // Debug logs
      console.log('Raw workouts from DB:', workouts);
      console.log('Fetch error if any:', error);

      if (error) {
        console.error('Fetch error:', error);
        setError(`Failed to fetch workouts: ${error.message}`);
        return;
      }

      if (!workouts || workouts.length === 0) {
        console.log('No workouts found for user:', user.id);
        // Initialize with empty data
        setWeeklyData({
          labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
        });
        setMonthlyProgress({
          workouts: 0,
          calories: 0,
          duration: 0,
          streak: 0,
        });
        return;
      }

      // 3. Process the data
      const processedData = processWorkoutData(workouts);
      console.log('Processed weekly data:', processedData);

      const monthlyStats = calculateMonthlyStats(workouts);
      console.log('Monthly stats:', monthlyStats);

      // 4. Update state
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
      shadowOffset: { width: 0, height: 2 },
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
      shadowOffset: { width: 0, height: 2 },
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
  });

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={checkDatabaseSetup}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  console.log("monthlyProgress====", monthlyProgress);

  const renderDebugInfo = () => {
    if (__DEV__) {
      return (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Monthly Progress: {'\n'}
            Workouts: {monthlyProgress.workouts}{'\n'}
            Calories: {monthlyProgress.calories}{'\n'}
            Duration: {monthlyProgress.duration}{'\n'}
            Streak: {monthlyProgress.streak}
          </Text>
          <Text style={styles.debugText}>
            Weekly Data: {'\n'}
            Labels: {weeklyData.labels.join(', ')}{'\n'}
            Data: {weeklyData.datasets[0].data.join(', ')}
          </Text>
        </View>
      );
    }
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

  console.log('Processed data:', { labels, data }); // Debug log

  return {
    labels,
    datasets: [{
      data,
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    }]
  };
};

const calculateMonthlyStats = (workouts: WorkoutData[]) => {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  console.log('Calculating monthly stats from:', monthStart); // Debug log

  const monthWorkouts = workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    return workoutDate >= monthStart;
  });

  console.log('Workouts this month:', monthWorkouts); // Debug log

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
  const sortedWorkouts = [...workouts].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get unique dates
  const uniqueDates = Array.from(new Set(
    sortedWorkouts.map(w => new Date(w.date).toDateString())
  ));

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

    if (new Date(uniqueDates[i]).toDateString() === previousDate.toDateString()) {
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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  const { data, error } = await supabase
    .from('workouts')
    .insert([
      {
        user_id: user.id,
        date: new Date().toISOString(),
        ...workoutData
      }
    ]);

  console.log('Workout added:', { data, error });
  return { data, error };
};

export default ProgressScreen;

