import React from 'react';
import {View, ScrollView, StyleSheet, Dimensions} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {Text} from 'react-native';
import {LineChart} from 'react-native-chart-kit';

const weeklyData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      data: [30, 45, 28, 80, 99, 43, 50],
    },
  ],
};

const monthlyProgress = {
  workouts: 24,
  calories: 12400,
  duration: 1080,
  streak: 15,
};

const ProgressScreen = () => {
  const {theme} = useTheme();
  const screenWidth = Dimensions.get('window').width;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.m,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.m,
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xl,
    },
    statCard: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadii.m,
      padding: theme.spacing.m,
      width: '48%',
      marginBottom: theme.spacing.m,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    statLabel: {
      fontSize: 14,
      color: theme.colors.text,
    },
    chartContainer: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadii.m,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.xl,
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.m,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
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
              {Math.floor(monthlyProgress.duration / 60)}h
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
        </View>
      </View>
    </ScrollView>
  );
};

export default ProgressScreen;
