import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen = () => {
    const { theme, themeType, setThemeType } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
            padding: theme.spacing.m,
        },
        section: {
            marginBottom: theme.spacing.l,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: theme.spacing.s,
        },
        option: {
            backgroundColor: theme.colors.card,
            padding: theme.spacing.m,
            borderRadius: theme.borderRadii.m,
            marginBottom: theme.spacing.s,
        },
        optionText: {
            color: theme.colors.text,
        },
        selectedOption: {
            backgroundColor: theme.colors.primary,
        },
        selectedOptionText: {
            color: '#FFFFFF',
        },
    });

    const themeOptions = [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'System', value: 'system' },
    ] as const;

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Theme</Text>
                {themeOptions.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        style={[
                            styles.option,
                            themeType === option.value && styles.selectedOption,
                        ]}
                        onPress={() => setThemeType(option.value)}>
                        <Text
                            style={[
                                styles.optionText,
                                themeType === option.value && styles.selectedOptionText,
                            ]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default SettingsScreen; 