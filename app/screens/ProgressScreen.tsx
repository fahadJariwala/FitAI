import React, {useState} from 'react';
import {View, Text, StyleSheet, Dimensions, Animated} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {getUserProgress} from '../services/exerciseTrackingService';
import {useUser} from '../hooks/useUser'; // Your existing user hook
import {LoadingCard} from '../components/LoadingCard'; // Make sure this is imported
import {useFocusEffect} from '@react-navigation/native';

const ProgressScreen = () => {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useUser(); // Your existing user hook

  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
    }, [user?.id]),
  );

  const loadProgress = async () => {
    if (!user?.id) {
      setProgress([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getUserProgress(user.id);
      setProgress(data);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.id) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Please login to view your progress</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        {/* Title skeleton */}
        <LoadingCard
          style={{
            height: 32,
            width: '60%',
            marginBottom: 20,
            borderRadius: 8,
          }}
        />

        {/* Chart skeleton */}
        <LoadingCard
          style={{
            height: 220,
            width: Dimensions.get('window').width - 40,
            marginVertical: 8,
            borderRadius: 16,
          }}
        />

        {/* Stats Title skeleton */}
        <LoadingCard
          style={{
            height: 24,
            width: '40%',
            marginTop: 20,
            marginBottom: 10,
            borderRadius: 6,
          }}
        />

        {/* Stats Value skeleton */}
        <LoadingCard
          style={{
            height: 20,
            width: '30%',
            borderRadius: 6,
          }}
        />
      </View>
    );
  }

  // Prepare data for the line chart
  const chartData = {
    labels: progress
      .slice(-7)
      .map(p => new Date(p.date).toLocaleDateString('en-US', {day: '2-digit'})),
    datasets: [
      {
        data: progress.slice(-7).map(p => p.minutes_spent),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Exercise Progress</Text>

      {progress.length > 0 ? (
        <>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={styles.chart}
          />

          <Text style={styles.statsTitle}>Last 7 Days Summary</Text>
          <Text style={styles.stats}>
            Total Time:{' '}
            {progress.slice(-7).reduce((sum, p) => sum + p.minutes_spent, 0)}{' '}
            minutes
          </Text>
        </>
      ) : (
        <Text style={styles.message}>No progress recorded yet</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  stats: {
    fontSize: 16,
    color: '#666',
  },
});

export default ProgressScreen;
