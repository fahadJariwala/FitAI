import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

interface ExerciseDetailProps {
    route: {
        params: {
            exercise: {
                id: string;
                name: string;
                gifUrl: string;
                target: string;
                equipment: string;
                bodyPart: string;
                instructions: string[];
            };
        };
    };
    navigation: any;
}

const ExerciseDetailScreen: React.FC<ExerciseDetailProps> = ({ route, navigation }) => {
    const { theme } = useTheme();

    const { exercise } = route.params;
    const [timer, setTimer] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useCurrentUser();

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer + 1);
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isActive]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimer(0);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            width: '100%',
            height: width * 0.8,
        },
        gifContainer: {
            width: '100%',
            height: '100%',
            backgroundColor: theme.colors.card,
            justifyContent: 'center',
            alignItems: 'center',
        },
        backButton: {
            position: 'absolute',
            top: 20,
            left: 20,
            backgroundColor: theme.colors.card,
            borderRadius: 30,
            padding: 8,
            zIndex: 1,
        },
        content: {
            flex: 1,
            padding: theme.spacing.m,
            paddingBottom: 100,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: theme.spacing.m,
        },
        infoCard: {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadii.m,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
        },
        infoRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
        },
        infoLabel: {
            color: theme.colors.text,
            opacity: 0.7,
            width: 100,
        },
        infoValue: {
            color: theme.colors.text,
            flex: 1,
            fontWeight: '500',
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: theme.spacing.s,
        },
        instruction: {
            color: theme.colors.text,
            marginBottom: theme.spacing.s,
            lineHeight: 20,
        },
        trackButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.borderRadii.m,
            padding: theme.spacing.m,
            alignItems: 'center',
            marginTop: theme.spacing.m,
        },
        trackButtonText: {
            color: '#FFFFFF',
            fontWeight: '600',
            fontSize: 16,
        },
        timerContainer: {
            alignItems: 'center',
            marginVertical: theme.spacing.m,
            backgroundColor: theme.colors.card,
            padding: theme.spacing.m,
            borderRadius: theme.borderRadii.m,
        },
        timerText: {
            fontSize: 48,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: theme.spacing.m,
        },
        timerControls: {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: theme.spacing.m,
        },
        timerButton: {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.l,
            paddingVertical: theme.spacing.s,
            borderRadius: theme.borderRadii.s,
        },
        timerButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
        },
    });

    const trackExercise = async () => {
        if (!user?.id) {
            Alert.alert('Error', 'Please login to track progress');
            return;
        }

        if (timer === 0) {
            Alert.alert('Warning', 'Please track some time before completing');
            return;
        }

        setLoading(true);
        try {
            // Log the data being sent for debugging
            const exerciseData = {
                user_id: user.id,
                exercise_id: exercise.id,
                exercise_name: exercise.name,
                target_muscle: exercise.target,
                equipment_used: exercise.equipment,
                body_part: exercise.bodyPart,
                duration_minutes: Math.round(timer / 60), // Convert seconds to minutes
                completed_at: new Date().toISOString()
            };

            console.log('Sending data:', exerciseData); // Debug log

            const { data, error } = await supabase
                .from('exercise_tracking')
                .insert(exerciseData)
                .select();

            if (error) throw error;

            Alert.alert(
                'Success',
                `Exercise tracked for ${formatTime(timer)}!`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('Error tracking exercise:', error);
            Alert.alert('Error', 'Failed to track exercise. Please try again.');
        } finally {
            setLoading(false);
            resetTimer();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={{ uri: exercise.gifUrl }}
                    style={styles.gifContainer}
                    resizeMode="contain"
                    isAnimated={true}
                />
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}
                contentContainerStyle={{ paddingBottom: 50 }}>
                <Text style={styles.title}>{exercise.name}</Text>

                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Target</Text>
                        <Text style={styles.infoValue}>{exercise.target}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Equipment</Text>
                        <Text style={styles.infoValue}>{exercise.equipment}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Body Part</Text>
                        <Text style={styles.infoValue}>{exercise.bodyPart}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Instructions</Text>
                {exercise.instructions.map((instruction, index) => (
                    <Text key={index} style={styles.instruction}>
                        {index + 1}. {instruction}
                    </Text>
                ))}

                <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>{formatTime(timer)}</Text>
                    <View style={styles.timerControls}>
                        <TouchableOpacity
                            style={styles.timerButton}
                            onPress={toggleTimer}>
                            <Text style={styles.timerButtonText}>
                                {isActive ? 'Pause' : 'Start'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.timerButton}
                            onPress={resetTimer}>
                            <Text style={styles.timerButtonText}>Reset</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.trackButton, loading && { opacity: 0.7 }]}
                    onPress={trackExercise}
                    disabled={loading}>
                    <Text style={styles.trackButtonText}>
                        {loading ? 'Tracking...' : 'Complete Exercise'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default ExerciseDetailScreen; 