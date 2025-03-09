interface ExerciseSet {
    reps: number;
    weight: number;
    duration?: number; // For time-based exercises
    date: Date;
}

interface ExerciseTracking {
    exerciseId: string;
    exerciseName: string;
    sets: ExerciseSet[];
}

interface WorkoutSession {
    id: string;
    date: Date;
    exercises: ExerciseTracking[];
    duration: number;
    notes?: string;
}

interface UserProgress {
    userId: string;
    workoutHistory: WorkoutSession[];
    statistics: {
        totalWorkouts: number;
        totalTime: number;
        favoriteExercises: string[];
        // Add more statistics as needed
    };
} 