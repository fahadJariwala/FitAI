import React from 'react';
import {View, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {Text} from 'react-native';

const HomeScreen = () => {
  const {theme} = useTheme();

  const styles = StyleSheet.create({
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
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Welcome back, User!</Text>
          <Text style={{color: theme.colors.text}}>
            Ready for today's workout?
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>320</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>45</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.quickActionCard}>
          <Text style={styles.quickActionText}>Start Today's Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionCard}>
          <Text style={styles.quickActionText}>View Workout Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionCard}>
          <Text style={styles.quickActionText}>Track Progress</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
