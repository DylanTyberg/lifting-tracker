import { useEffect, useState } from "react";
import { useUser } from "../../Contexts/UserContext";
import "../Workout/Workout.css"

const Workout = () => {
    const { state, dispatch } = useUser();
    
    const [availableExercises, setAvailableExercises] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [workoutExercises, setWorkoutExercises] = useState([]);
    const [addExerciseModal, setAddExerciseModal] = useState(false);
    const [logSetModal, setLogSetModal] = useState({ open: false, exerciseIndex: null });
    const [modalSets, setModalSets] = useState([{ weight: 0, reps: 0 }]);

    useEffect(() => {
        getExercises();
    }, [])

    const getExercises = async () => {
        try {
            const response = await fetch("http://localhost:3000/exercises", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            const data = await response.json()
            console.log(data.exercises)
            setAvailableExercises(data.exercises);
            
            // Process exercises to create historyData
            const processedHistory = data.exercises.map(exercise => {
                const exerciseName = exercise.sort_key;
                const userExerciseData = state.exercises[exerciseName] || [];

                let best = { weight: null, reps: null };
                let last = { weight: null, reps: null };

                if (userExerciseData.length > 0) {
                    const lastWorkout = userExerciseData[0];
                    if (lastWorkout.sets && lastWorkout.sets.length > 0) {
                        const lastBestSet = lastWorkout.sets.reduce((best, set) => {
                            if (!best) return set;
                            if (set.weight > best.weight) return set;
                            if (set.weight === best.weight && set.reps > best.reps) return set;
                            return best;
                        }, null);
                        
                        last = { 
                            weight: lastBestSet?.weight || null, 
                            reps: lastBestSet?.reps || null 
                        };
                    }

                    userExerciseData.forEach(workout => {
                        workout.sets?.forEach(set => {
                            if (!best.weight || set.weight > best.weight) {
                                best = { weight: set.weight, reps: set.reps };
                            } else if (set.weight === best.weight && set.reps > best.reps) {
                                best = { weight: set.weight, reps: set.reps };
                            }
                        });
                    });
                }

                return {
                    name: exerciseName,
                    best: best,
                    last: last
                };
            });
            console.log(processedHistory)
            setHistoryData(processedHistory);

        } catch (error) {
            console.log(error)
        }
    }

    const addExerciseToWorkout = (exerciseName) => {
        // Check if already added
        if (workoutExercises.some(ex => ex.name === exerciseName)) {
            alert("Exercise already added to workout");
            return;
        }

        const exerciseHistory = historyData.find(ex => ex.name === exerciseName);
        
        setWorkoutExercises([
            ...workoutExercises,
            {
                name: exerciseName,
                sets: [],
                last: exerciseHistory?.last || { weight: null, reps: null },
                best: exerciseHistory?.best || { weight: null, reps: null }
            }
        ]);
        setAddExerciseModal(false);
    }

    const removeExerciseFromWorkout = (index) => {
        setWorkoutExercises(workoutExercises.filter((_, i) => i !== index));
    }

    const openLogSetModal = (index) => {
        setLogSetModal({ open: true, exerciseIndex: index });
        setModalSets([{ weight: 0, reps: 0 }]);
    }

    const saveWorkoutSets = () => {
        const updatedWorkout = [...workoutExercises];
        updatedWorkout[logSetModal.exerciseIndex].sets = modalSets;
        setWorkoutExercises(updatedWorkout);
        
        setLogSetModal({ open: false, exerciseIndex: null });
        setModalSets([{ weight: 0, reps: 0 }]);
    }

    const finishWorkout = async () => {
        const today = new Date().toISOString().split('T')[0];
        
        try {
            // Save the entire workout
            const workoutResponse = await fetch(`http://localhost:3000/user/workouts/${state.user.userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: state.user.userId,
                    sort_key: `workout#${today}`,
                    exercises: workoutExercises
                })
            });

            if (!workoutResponse.ok) {
                throw new Error("Failed to save workout");
            }

            // Save each exercise with sets to exercises table (for history tracking)
            for (const exercise of workoutExercises) {
                if (exercise.sets.length > 0) {
                    await fetch(`http://localhost:3000/user/exercises/${state.user.userId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            id: state.user.userId,
                            sort_key: `exercise#${exercise.name}#${today}`,
                            sets: exercise.sets
                        })
                    });

                    // Update local state for each exercise
                    dispatch({
                        type: 'ADD_EXERCISE_ENTRY',
                        payload: {
                            exerciseName: exercise.name,
                            entry: {
                                date: today,
                                sets: exercise.sets
                            }
                        }
                    });
                }
            }

            // Add workout to local state
            dispatch({
                type: 'ADD_WORKOUT',
                payload: {
                    date: today,
                    exercises: workoutExercises
                }
            });
            
            alert("Workout saved successfully!");
            setWorkoutExercises([]);
            
        } catch (error) {
            console.error("Error saving workout:", error);
            alert("Failed to save workout");
        }
    }

    return (
        <div className="workout-page">
            <div className="workout-header">
                <h1 className="workout-title">Active Workout</h1>
                {workoutExercises.length > 0 && (
                    <button className="finish-workout-button" onClick={finishWorkout}>
                        Finish Workout
                    </button>
                )}
            </div>

            <div className="workout-content">
                {workoutExercises.length === 0 ? (
                    <div className="empty-workout">
                        <p className="empty-workout-text">No exercises added yet</p>
                        <button 
                            className="add-first-exercise-button"
                            onClick={() => setAddExerciseModal(true)}
                        >
                            + Add Exercise
                        </button>
                    </div>
                ) : (
                    <div className="workout-exercises">
                        {workoutExercises.map((exercise, index) => (
                            <div className="workout-exercise-card" key={index}>
                                <div className="workout-exercise-header">
                                    <h2 className="workout-exercise-name">{exercise.name}</h2>
                                    <button 
                                        className="remove-exercise-button"
                                        onClick={() => removeExerciseFromWorkout(index)}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="workout-exercise-stats">
                                    <div className="stat-block">
                                        <p className="stat-label">Last</p>
                                        <span className="stat-value">{exercise.last?.weight ?? "--"} lbs</span>
                                        <span className="stat-divider">×</span>
                                        <span className="stat-value">{exercise.last?.reps ?? "--"} reps</span>
                                    </div>

                                    <div className="stat-separator" />

                                    <div className="stat-block">
                                        <p className="stat-label">Best</p>
                                        <span className="stat-value">{exercise.best?.weight ?? "--"} lbs</span>
                                        <span className="stat-divider">×</span>
                                        <span className="stat-value">{exercise.best?.reps ?? "--"} reps</span>
                                    </div>
                                </div>

                                {exercise.sets.length > 0 && (
                                    <div className="logged-sets">
                                        <p className="logged-sets-label">Today's Sets</p>
                                        {exercise.sets.map((set, setIndex) => (
                                            <div className="logged-set" key={setIndex}>
                                                <span className="set-number">Set {setIndex + 1}</span>
                                                <span className="set-details">
                                                    {set.weight} lbs × {set.reps} reps
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button 
                                    className="log-button"
                                    onClick={() => openLogSetModal(index)}
                                >
                                    {exercise.sets.length > 0 ? "Edit Sets" : "+ Log Sets"}
                                </button>
                            </div>
                        ))}

                        <button 
                            className="add-exercise-button"
                            onClick={() => setAddExerciseModal(true)}
                        >
                            + Add Exercise
                        </button>
                    </div>
                )}
            </div>

            {/* Add Exercise Modal */}
            {addExerciseModal && (
                <div className="modal-overlay" onClick={() => setAddExerciseModal(false)}>
                    <div className="add-exercise-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Add Exercise to Workout</h2>
                            <button 
                                className="modal-close-button" 
                                onClick={() => setAddExerciseModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-content">
                            <div className="exercise-selection-list">
                                {availableExercises.map((exercise, index) => (
                                    <button
                                        key={index}
                                        className="exercise-selection-item"
                                        onClick={() => addExerciseToWorkout(exercise.sort_key)}
                                        disabled={workoutExercises.some(ex => ex.name === exercise.sort_key)}
                                    >
                                        <span className="exercise-selection-name">{exercise.sort_key}</span>
                                        {workoutExercises.some(ex => ex.name === exercise.sort_key) && (
                                            <span className="already-added-badge">Added</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Log Sets Modal */}
            {logSetModal.open && (
                <div className="modal-overlay" onClick={() => setLogSetModal({ open: false, exerciseIndex: null })}>
                    <div className="exercise-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{workoutExercises[logSetModal.exerciseIndex]?.name}</h2>
                            <button 
                                className="modal-close-button" 
                                onClick={() => setLogSetModal({ open: false, exerciseIndex: null })}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-content">
                            <div className="modal-sets-list">
                                {modalSets.map((set, index) => (
                                    <div className="set-row" key={index}>
                                        <span className="set-number">Set {index + 1}</span>
                                        <div className="set-inputs">
                                            <div className="input-group">
                                                <input
                                                    type="number"
                                                    className="set-input"
                                                    placeholder="0"
                                                    value={set.weight || ''}
                                                    onChange={(e) => {
                                                        const newSets = [...modalSets];
                                                        newSets[index].weight = parseFloat(e.target.value) || 0;
                                                        setModalSets(newSets);
                                                    }}
                                                />
                                                <span className="input-label">lbs</span>
                                            </div>
                                            <span className="input-separator">×</span>
                                            <div className="input-group">
                                                <input
                                                    type="number"
                                                    className="set-input"
                                                    placeholder="0"
                                                    value={set.reps || ''}
                                                    onChange={(e) => {
                                                        const newSets = [...modalSets];
                                                        newSets[index].reps = parseInt(e.target.value) || 0;
                                                        setModalSets(newSets);
                                                    }}
                                                />
                                                <span className="input-label">reps</span>
                                            </div>
                                        </div>
                                        {modalSets.length > 1 && (
                                            <button
                                                className="remove-set-button"
                                                onClick={() => {
                                                    const newSets = modalSets.filter((_, i) => i !== index);
                                                    setModalSets(newSets);
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button 
                                className="add-set-button"
                                onClick={() => setModalSets([...modalSets, { weight: 0, reps: 0 }])}
                            >
                                + Add Set
                            </button>
                        </div>

                        <div className="modal-footer">
                            <button 
                                className="modal-cancel-button"
                                onClick={() => {
                                    setLogSetModal({ open: false, exerciseIndex: null });
                                    setModalSets([{ weight: 0, reps: 0 }]);
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="modal-save-button"
                                onClick={saveWorkoutSets}
                            >
                                Save Sets
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default Workout;