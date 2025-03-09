import AsyncStorage from '@react-native-storage/async-storage';

interface ExerciseProgress {
    date: string;
    timeSpent: number; // in minutes
    completed: number;
}

interface DailyProgress {
    [date: string]: {
        totalTime: number;
        totalExercises: number;
    }
}

// Helper to get storage key for specific user
const getUserProgressKey = (userId: string) => `@progress_${userId}`;
const getUserDailyProgressKey = (userId: string) => `@daily_progress_${userId}`;

export const trackExercise = async (userId: string, timeSpent: number) => {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const today = new Date().toISOString().split('T')[0];
        const storageKey = getUserDailyProgressKey(userId);

        // Get existing daily progress for this user
        const existingProgress = await AsyncStorage.getItem(storageKey);
        const dailyProgress: DailyProgress = existingProgress ? JSON.parse(existingProgress) : {};

        // Update today's progress
        if (!dailyProgress[today]) {
            dailyProgress[today] = {
                totalTime: 0,
                totalExercises: 0,
            };
        }

        dailyProgress[today].totalTime += timeSpent;
        dailyProgress[today].totalExercises += 1;

        // Save updated progress
        await AsyncStorage.setItem(storageKey, JSON.stringify(dailyProgress));

        return true;
    } catch (error) {
        console.error('Error tracking exercise:', error);
        return false;
    }
};

export const getDailyProgress = async (userId: string) => {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const storageKey = getUserDailyProgressKey(userId);
        const progress = await AsyncStorage.getItem(storageKey);
        return progress ? JSON.parse(progress) : {};
    } catch (error) {
        console.error('Error getting progress:', error);
        return {};
    }
};

// Optional: Add function to clear user data when they logout
export const clearUserProgress = async (userId: string) => {
    try {
        const progressKey = getUserProgressKey(userId);
        const dailyProgressKey = getUserDailyProgressKey(userId);
        await AsyncStorage.multiRemove([progressKey, dailyProgressKey]);
    } catch (error) {
        console.error('Error clearing progress:', error);
    }
}; 