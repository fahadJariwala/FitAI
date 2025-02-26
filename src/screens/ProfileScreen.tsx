import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {Text} from 'react-native';

const ProfileScreen = () => {
  const {theme, themeType, setThemeType} = useTheme();

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

  const handleThemeChange = (type: 'light' | 'dark' | 'system') => {
    setThemeType(type);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@example.com</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Age</Text>
            <Text style={styles.rowValue}>28</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Weight</Text>
            <Text style={styles.rowValue}>75 kg</Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>Height</Text>
            <Text style={styles.rowValue}>180 cm</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Theme</Text>
            <View style={{flexDirection: 'row', gap: 10}}>
              <TouchableOpacity onPress={() => handleThemeChange('light')}>
                <Text
                  style={[
                    styles.rowValue,
                    themeType === 'light' && {color: theme.colors.primary},
                  ]}>
                  Light
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleThemeChange('dark')}>
                <Text
                  style={[
                    styles.rowValue,
                    themeType === 'dark' && {color: theme.colors.primary},
                  ]}>
                  Dark
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleThemeChange('system')}>
                <Text
                  style={[
                    styles.rowValue,
                    themeType === 'system' && {color: theme.colors.primary},
                  ]}>
                  System
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>Notifications</Text>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
