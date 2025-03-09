import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { trackExerciseTime } from '../services/exerciseTrackingService';
import { useUser } from '../hooks/useUser'; // Your existing user hook from profile screen

const ExerciseDetailsScreen = ({ route }) => {
    const { exercise } = route.params;
    const [timer, setTimer] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(false);

    const user = useUser(); // Your existing user hook

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive) {
            interval = setInterval(() => {
                setTimer(timer => timer + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const handleStartStop = () => {
        setIsActive(!isActive);
    };

    const handleComplete = async () => {
        if (!user?.id) {
            Alert.alert('Error', 'Please login to track progress');
            return;
        }

        setLoading(true);
        try {
            const minutesSpent = Math.round(timer / 60);
            await trackExerciseTime(user.id, minutesSpent);
            Alert.alert('Success', 'Progress tracked successfully!');
            setTimer(0);
            setIsActive(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to track progress');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* ... existing exercise details ... */}

            <View style={styles.timerContainer}>
                <Text style={styles.timerText}>
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleStartStop}
                >
                    <Text style={styles.buttonText}>
                        {isActive ? 'Pause' : 'Start'}
                    </Text>
                </TouchableOpacity>

                {timer > 0 && (
                    <TouchableOpacity
                        style={[styles.button, loading && styles.disabledButton]}
                        onPress={handleComplete}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Saving...' : 'Complete'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // ... existing styles ...
    timerContainer: {
        alignItems: 'center',
        padding: 20,
    },
    timerText: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        width: 200,
        alignItems: 'center',
        marginVertical: 5,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
}); 