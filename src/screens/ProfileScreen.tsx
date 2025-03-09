import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const ProfileScreen = () => {
  const { theme, themeType, setThemeType } = useTheme();
  const navigation = useNavigation();
  const { signOut, user } = useAuth();
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    age: null,
    weight: null,
    height: null,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        console.log('No user found');
        return;
      }

      const { data, error } = await supabase
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
      Alert.alert('Error', 'Failed to load profile data');
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
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    avatarContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.card,
      marginBottom: theme.spacing.m,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: 36,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    email: {
      fontSize: 16,
      color: theme.colors.text,
      opacity: 0.7,
    },
    section: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadii.m,
      marginBottom: theme.spacing.m,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.m,
      paddingHorizontal: theme.spacing.m,
      paddingTop: theme.spacing.m,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowLabel: {
      fontSize: 16,
      color: theme.colors.text,
    },
    rowValue: {
      fontSize: 16,
      color: theme.colors.text,
      opacity: 0.7,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadii.m,
      padding: theme.spacing.m,
      alignItems: 'center',
      marginTop: theme.spacing.m,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  const handleThemeChange = async (type: 'light' | 'dark' | 'system') => {

    try {
      console.log('Changing theme to:', type);
      await AsyncStorage.setItem('themeType', type);
      setThemeType(type);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userDetails');
      signOut();
      navigation.replace('LoginScreen');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{profile.full_name || 'Fahad Jariwala'}</Text>
          <Text style={styles.email}>{profile.email || user?.email || 'No email'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>Name</Text>
            <Text style={styles.rowValue}>{profile.full_name ? `${profile.height} cm` : 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Age</Text>
            <Text style={styles.rowValue}>{profile.age || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Weight</Text>
            <Text style={styles.rowValue}>{profile.weight ? `${profile.weight} kg` : 'N/A'}</Text>
          </View>

        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Theme</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {(['light', 'dark', 'system'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleThemeChange(type)}
                  disabled={themeType === type}
                >
                  <Text
                    style={[
                      styles.rowValue,
                      { opacity: 1 },
                      themeType === type && {
                        color: theme.colors.primary,
                        fontWeight: 'bold'
                      },
                    ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
