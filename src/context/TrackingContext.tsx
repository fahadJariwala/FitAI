import React, { createContext, useContext, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TrackingContext = createContext<any>(null);

const initialState = {
    currentSession: null,
    workoutHistory: [],
    statistics: {
        totalWorkouts: 0,
        totalTime: 0,
        favoriteExercises: [],
    },
};

export const TrackingProvider: React.FC = ({ children }) => {
    const [state, dispatch] = useReducer(trackingReducer, initialState);

    const startWorkout = () => {
        dispatch({
            type: 'START_WORKOUT',
            payload: {
                id: Date.now().toString(),
                date: new Date(),
                exercises: [],
                duration: 0,
            },
        });
    };

    const addExerciseSet = (exerciseId: string, set: ExerciseSet) => {
        dispatch({
            type: 'ADD_SET',
            payload: { exerciseId, set },
        });
    };

    const finishWorkout = (notes?: string) => {
        dispatch({
            type: 'FINISH_WORKOUT',
            payload: { notes },
        });
        // Save to AsyncStorage
        saveWorkoutHistory(state.workoutHistory);
    };

    return (
        <TrackingContext.Provider
            value={{
                ...state,
                startWorkout,
                addExerciseSet,
                finishWorkout,
            }}>
            {children}
        </TrackingContext.Provider>
    );
};

export const useTracking = () => useContext(TrackingContext); 