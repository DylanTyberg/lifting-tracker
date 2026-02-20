import "../Workouts/Workouts.css"
import { useNavigate } from "react-router-dom";
import { useUser } from "../Contexts/UserContext";
import { useState, useEffect } from "react";

const Workouts = () => {
    
    const navigate = useNavigate();
    const {state, dispatch} = useUser();
    console.log(state.templates)


    const [availableExercises, setAvailableExcersises] = useState([])
    const [addTemplateModal, setAddTemplateModal] = useState(false)
    const [templateModalName, setTemplateModalName] = useState("");
    const [templateModalExercises, setTemplateModalExercises] = useState([])
    const [addExerciseToTemplateModal, setAddExerciseToTemplateModal] = useState(false);
    const [viewWorkoutModal, setViewWorkoutModal] = useState(false);
    const [viewWorkoutData, setViewWorkoutData] = useState({});


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
            setAvailableExcersises(data.exercises);
            } catch (error) {
            console.log(error)
        }
    }

    const addTemplate = async () => {
        try {
            const data = await fetch(`http://localhost:3000/user/workouts/templates/${state.user.userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: state.user.userId,
                    sort_key: `template#${templateModalName}`,
                    exercises: templateModalExercises
                })
            })

            dispatch({
                type: "ADD_TEMPLATE",
                payload: {
                    id: state.user.userId,
                    sort_key: `template#${templateModalName}`,
                    exercises: templateModalExercises
                }
            })
            
            setAddTemplateModal(false);
            setTemplateModalName("");
            setTemplateModalExercises([]);
            
            
            
        } catch (error) {

        }
    }
    
    return (
    <div className="workout-page">
        <div className="workout-page-header">
            
            <button className="start-workout-button" onClick={() => navigate("/workouts/workout")}>▶ Quick Start</button>
        </div>

        <div className="workout-templates">
            <h2 className="templates-label">My Templates</h2>
            <div className="template-grid">
                {state.templates && state.templates.map((template, index) => (
                    <div className="template-card" key={template.id || index}>
                        <div className="template-card-header">
                            <h2 className="template-name">{template.name}</h2>
                            <button className="template-edit-button" onClick={() => {
                                console.log(template)
                                setTemplateModalName(template.name)
                                setTemplateModalExercises(template.exercises)
                                setAddTemplateModal(true);
                            }}>Edit</button>
                        </div>

                        <p className="template-exercise-count">
                            {template.exercises.length} exercise{template.exercises.length !== 1 ? "s" : ""}
                        </p>

                        <div className="template-exercise-list">
                            {template.exercises.map((exercise, index) => (
                                <span className="template-exercise-name" key={ index}>
                                    {exercise}
                                    {index < template.exercises.length - 1 && (
                                        <span className="exercise-dot">·</span>
                                    )}
                                </span>
                            ))}
                        </div>

                        <button className="template-start-button" onClick={() => {
                                navigate("/workouts/workout", { 
                                    state: { 
                                        exercises: template.exercises.map(ex => ex) 
                                    } 
                                });
                            }}>▶ Start</button>
                    </div>
                ))}

                <button className="add-template-button" onClick={() => setAddTemplateModal(true)}>+ New Template</button>
            </div>
        </div>
        <div className="recent-workouts">
            <h2 className="templates-label">Recent Workouts</h2>
            <div className="template-grid">
                {state.workouts && state.workouts.map((workout, index) => (
                    <div className="template-card" key={index}>
                        <div className="template-card-header">
                            <h2 className="template-name">
                                {new Date(workout.date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                })}
                            </h2>
                            <button className="template-edit-button" onClick={() => {setViewWorkoutData(workout); setViewWorkoutModal(true)}}>View</button>
                        </div>

                        <p className="template-exercise-count">
                            {workout.exercises.length} exercise{workout.exercises.length !== 1 ? "s" : ""}
                        </p>

                        <div className="template-exercise-list">
                            {workout.exercises.map((exercise, exIndex) => (
                                <span className="template-exercise-name" key={exIndex}>
                                    {exercise.name}
                                    {exIndex < workout.exercises.length - 1 && (
                                        <span className="exercise-dot">·</span>
                                    )}
                                </span>
                            ))}
                        </div>

                        <button className="template-start-button" onClick={() => {
                                navigate("/workouts/workout", { 
                                    state: { 
                                        exercises: workout.exercises.map(ex => ex.name) 
                                    } 
                                });
                            }}>↻ Repeat</button>
                    </div>
                ))}
            </div>
        </div>
        {addTemplateModal && (
            <div className="modal-overlay" onClick={() => setAddTemplateModal(false)}>
                <div className="add-template-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2 className="modal-title">Create New Template</h2>
                        <button 
                            className="modal-close-button" 
                            onClick={() => {
                                setAddTemplateModal(false);
                                setTemplateModalName("");
                                setTemplateModalExercises([]);
                                
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    <div className="modal-content">
                        <div className="form-group">
                            <label htmlFor="template-name" className="form-label">
                                Template Name
                            </label>
                            <input
                                id="template-name"
                                type="text"
                                className="form-input"
                                placeholder="template name"
                                value={templateModalName}
                                onChange={(e) => setTemplateModalName(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="template-exercises-section">
                            <label className="form-label">Exercises</label>
                            
                            {templateModalExercises.length === 0 ? (
                                <div className="empty-exercises">
                                    <p className="empty-exercises-text">No exercises added yet</p>
                                </div>
                            ) : (
                                <div className="selected-exercises-list">
                                    {templateModalExercises.map((exercise, index) => (
                                        <div className="selected-exercise-item" key={index}>
                                            <span className="selected-exercise-name">{exercise}</span>
                                            <button
                                                className="remove-selected-exercise"
                                                onClick={() => {
                                                    setTemplateModalExercises(
                                                        templateModalExercises.filter((_, i) => i !== index)
                                                    );
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button 
                                className="add-exercise-to-template-button"
                                onClick={() => setAddExerciseToTemplateModal(true)}
                            >
                                + Add Exercise
                            </button>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button 
                            className="modal-cancel-button"
                            onClick={() => {
                                setAddTemplateModal(false);
                                setTemplateModalName("");
                                setTemplateModalExercises([]);
                            }}
                        >
                            Cancel
                        </button>
                        <button 
                            className="modal-save-button"
                            disabled={!templateModalName.trim() || templateModalExercises.length === 0}
                            onClick={() => {
                                addTemplate();
                                setAddTemplateModal(false);
                                setTemplateModalName("");
                                setTemplateModalExercises([]);
                                window.location.reload();
                                
                            }}
                        >
                            Create Template
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Nested modal for adding exercises to template */}
        {addExerciseToTemplateModal && (
            <div className="modal-overlay" onClick={() => setAddExerciseToTemplateModal(false)}>
                <div className="add-exercise-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2 className="modal-title">Add Exercise to Template</h2>
                        <button 
                            className="modal-close-button" 
                            onClick={() => setAddExerciseToTemplateModal(false)}
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
                                    onClick={() => {
                                        if (!templateModalExercises.includes(exercise.sort_key)) {
                                            setTemplateModalExercises([...templateModalExercises, exercise.sort_key]);
                                        }
                                        setAddExerciseToTemplateModal(false);
                                    }}
                                    disabled={templateModalExercises.includes(exercise.sort_key)}
                                >
                                    <span className="exercise-selection-name">{exercise.sort_key}</span>
                                    {templateModalExercises.includes(exercise.sort_key) && (
                                        <span className="already-added-badge">Added</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
        {viewWorkoutModal && (
            <div className="modal-overlay" onClick={() => setViewWorkoutModal(false)}>
                <div className="view-workout-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2 className="modal-title">
                            {new Date(viewWorkoutData.date).toLocaleDateString('en-US', { 
                                weekday: 'long',
                                month: 'long', 
                                day: 'numeric', 
                                year: 'numeric' 
                            })}
                        </h2>
                        <button 
                            className="modal-close-button" 
                            onClick={() => setViewWorkoutModal(false)}
                        >
                            ✕
                        </button>
                    </div>

                    <div className="modal-content">
                        <div className="view-workout-exercises">
                            {viewWorkoutData.exercises.map((exercise, exIndex) => (
                                <div className="view-exercise-card" key={exIndex}>
                                    <h3 className="view-exercise-name">{exercise.name}</h3>
                                    
                                    <div className="view-sets-list">
                                        {exercise.sets.map((set, setIndex) => (
                                            <div className="view-set-row" key={setIndex}>
                                                <span className="view-set-number">Set {setIndex + 1}</span>
                                                <div className="view-set-details">
                                                    <span className="view-set-weight">{set.weight} lbs</span>
                                                    <span className="view-set-divider">×</span>
                                                    <span className="view-set-reps">{set.reps} reps</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="view-exercise-summary">
                                        <div className="summary-stat">
                                            <span className="summary-label">Total Sets</span>
                                            <span className="summary-value">{exercise.sets.length}</span>
                                        </div>
                                        <div className="summary-stat">
                                            <span className="summary-label">Total Volume</span>
                                            <span className="summary-value">
                                                {exercise.sets.reduce((total, set) => 
                                                    total + (set.weight * set.reps), 0
                                                ).toLocaleString()} lbs
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button 
                            className="modal-cancel-button"
                            onClick={() => setViewWorkoutModal(false)}
                        >
                            Close
                        </button>
                        <button 
                            className="modal-save-button"
                            onClick={() => {
                                navigate("/workouts/workout", { 
                                    state: { 
                                        exercises: viewWorkoutData.exercises.map(ex => ex.name) 
                                    } 
                                });
                            }}
                        >
                            ↻ Repeat Workout
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
);
}
export default Workouts;