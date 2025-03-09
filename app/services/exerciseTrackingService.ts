import { supabase } from '../lib/supabase'; // Your existing supabase config

interface DailyProgress {
    id?: number;
    user_id: string;
    date: string;
    minutes_spent: number;
    created_at?: string;
}

export const trackExerciseTime = async (userId: string, minutesSpent: number) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Check if entry exists for today
        const { data: existingEntry } = await supabase
            .from('daily_exercise_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .single();

        if (existingEntry) {
            // Update existing entry
            const { error } = await supabase
                .from('daily_exercise_progress')
                .update({
                    minutes_spent: existingEntry.minutes_spent + minutesSpent
                })
                .eq('id', existingEntry.id);

            if (error) throw error;
        } else {
            // Create new entry
            const { error } = await supabase
                .from('daily_exercise_progress')
                .insert({
                    user_id: userId,
                    date: today,
                    minutes_spent: minutesSpent
                });

            if (error) throw error;
        }

        return true;
    } catch (error) {
        console.error('Error tracking exercise:', error);
        return false;
    }
};

export const getUserProgress = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('daily_exercise_progress')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: true });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error getting progress:', error);
        return [];
    }
}; 