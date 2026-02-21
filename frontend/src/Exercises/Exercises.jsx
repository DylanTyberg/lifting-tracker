import "../Exercises/Exercises.css"
import { useState, useEffect } from "react";
import { useUser } from "../Contexts/UserContext";
const Exercises = () => {
    
    const {state, dispatch} = useUser();
    

    const [exercises, setExcersises] = useState([])
    const [exerciseModal, setExerciseModal] = useState([false, ""])
    const [modalSets, setModalSets] = useState([
        {
            weight: 0,
            reps: 0
        },
    ])

    const [addExerciseModal, setAddExerciseModal] = useState(false)
    const [addExerciseModalName, setAddExerciseModalName] = useState("")

    const [historyData, setHistoryData] = useState([])

    useEffect(() => {
        getExercises();


        
    }, [])



    const getExercises = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/exercises`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            const data = await response.json()
            console.log(data.exercises)
            setExcersises(data.exercises);
            
            // Process exercises to create historyData
            const processedHistory = data.exercises.map(exercise => {
                const exerciseName = exercise.sort_key; // or however you identify the exercise
                const userExerciseData = state.exercises[exerciseName] || [];

                // Calculate best and last from user data
                let best = { weight: null, reps: null };
                let last = { weight: null, reps: null };

                if (userExerciseData.length > 0) {
                    // Last workout is the most recent (assuming sorted by date desc)
                    const lastWorkout = userExerciseData[0];
                    if (lastWorkout.sets && lastWorkout.sets.length > 0) {
                        // Find the best set from last workout (highest weight, or highest reps if tied)
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

                    // Find overall best across all workouts
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

    const addExercise = async () => {
        const today = new Date().toISOString().split('T')[0];
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/user/exercises/${state.user.userId}`, 
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id: state.user.userId,
                        sort_key: `exercise#${exerciseModal[1]}#${today}`,
                        sets: modalSets
                    })
                }
            )
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Exercise added:", data);
            
            // Update local state with new entry
            dispatch({
                type: 'ADD_EXERCISE_ENTRY',
                payload: {
                    exerciseName: exerciseModal[1],
                    entry: {
                        date: today,
                        sets: modalSets
                    }
                }
            });
            
            // Close modal and reset
            setExerciseModal([false, ""]);
            setModalSets([{ weight: 0, reps: 0 }]);
            
        } catch (error) {
            console.error("Error adding exercise:", error);
        }
    }

    const addBaseExercise = async () => {
        const exerciseExists = exercises.some(
            exercise => exercise.sort_key.toLowerCase() === addExerciseModalName.trim().toLowerCase()
        );
        
        if (exerciseExists) {
            alert("This exercise already exists!");
            // Or set an error state to display in the modal
            return;
        }
        try {
            const result = await fetch(`${process.env.REACT_APP_API_BASE_URL}/exercises/${addExerciseModalName}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            )
            
            if (!result.ok) {
                throw new Error(`HTTP error! status: ${result.status}`);
            }
            
            const data = await result.json();
            console.log("Exercise added:", data);
            
            // Refresh exercises list
            await getExercises();
            
            // Close modal and reset
            setAddExerciseModal(false);
            setAddExerciseModalName("");
            
        } catch (error) {
            console.error("Error adding exercise:", error);
        }
    }
    

    return (
    <div className="exercise-page">
        <div className="exercise-list">
            {exercises && exercises.map((item, index) => {
                const exerciseHistory = historyData?.find(exe => exe.name === item.sort_key);
                
                return (
                    <div className="exercise-card" key={item.id || index}>
                        <div className="exercise-card-header">
                            <h2 className="exercise-name">{item.sort_key}</h2>
                            {item.isPR && <span className="pr-badge">🏆 PR</span>}
                        </div>

                        <div className="exercise-stats">
                            <div className="stat-block">
                                <p className="stat-label">Last</p>
                                <span className="stat-value">{exerciseHistory?.last?.weight ?? "--"} lbs</span>
                                <span className="stat-divider">×</span>
                                <span className="stat-value">{exerciseHistory?.last?.reps ?? "--"} reps</span>
                            </div>

                            <div className="stat-separator" />

                            <div className="stat-block">
                                <p className="stat-label">Best</p>
                                <span className="stat-value">{exerciseHistory?.best?.weight ?? "--"} lbs</span>
                                <span className="stat-divider">×</span>
                                <span className="stat-value">{exerciseHistory?.best?.reps ?? "--"} reps</span>
                            </div>
                        </div>

                        <button className="log-button" onClick={() => setExerciseModal([true, item.sort_key])}>+ Log Set</button>
                    </div>
                );
            })}

            <button className="add-exercise-button" onClick={() => setAddExerciseModal(true)}>+ Add Exercise</button>
        </div>
        {exerciseModal[0] && (
            <div className="modal-overlay" onClick={() => setExerciseModal([false, ""])}>
                <div className="exercise-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{exerciseModal[1]}</h2>
                    <button 
                    className="modal-close-button" 
                    onClick={() => setExerciseModal([false, ""])}
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
                    onClick={() => setExerciseModal([false, ""])}
                    >
                    Cancel
                    </button>
                    <button 
                    className="modal-save-button"
                    onClick={() => {

                        addExercise();
                        
                    }}
                    >
                    Save
                    </button>
                </div>
                </div>
            </div>
            )}
            {addExerciseModal && (
                <div className="modal-overlay" onClick={() => setAddExerciseModal(false)}>
                    <div className="add-exercise-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Add New Exercise</h2>
                            <button 
                                className="modal-close-button" 
                                onClick={() => setAddExerciseModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-content">
                            <div className="form-group">
                                <label htmlFor="exercise-name" className="form-label">
                                    Exercise Name
                                </label>
                                <input
                                    id="exercise-name"
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Bench Press, Squat, Deadlift"
                                    value={addExerciseModalName}
                                    onChange={(e) => setAddExerciseModalName(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="common-exercises">
                                <p className="common-exercises-label">Quick Add:</p>
                                <div className="common-exercises-grid">
                                    {["Squat", "Bench Press", "Deadlift", "Overhead Press", "Barbell Row", "Pull Up"].map((name) => (
                                        <button
                                            key={name}
                                            className="common-exercise-button"
                                            onClick={() => setAddExerciseModalName(name)}
                                        >
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button 
                                className="modal-cancel-button"
                                onClick={() => {
                                    setAddExerciseModal(false);
                                    setAddExerciseModalName("");
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="modal-save-button"
                                disabled={!addExerciseModalName.trim()}
                                onClick={() => {
                                    addBaseExercise();
                                }}
                            >
                                Add Exercise
                            </button>
                        </div>
                    </div>
                </div>
            )}
    </div>
);
}
export default Exercises;