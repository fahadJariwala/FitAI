import React, { useState } from 'react';
import { useTracking } from '../context/TrackingContext';

const ExerciseTrackingForm = ({ exerciseId, exerciseName }) => {
    const { addExerciseSet } = useTracking();
    const [reps, setReps] = useState('');
    const [weight, setWeight] = useState('');

    const handleAddSet = () => {
        addExerciseSet(exerciseId, {
            reps: parseInt(reps),
            weight: parseFloat(weight),
            date: new Date(),
        });
        setReps('');
        setWeight('');
    };

    // Render form...
};

export default ExerciseTrackingForm; 