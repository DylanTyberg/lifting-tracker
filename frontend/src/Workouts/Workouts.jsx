import "../Workouts/Workouts.css"
import { useNavigate } from "react-router-dom";
import { useUser } from "../Contexts/UserContext";
const Workouts = () => {
    const testTemplates = [{
            name: "1",
            exercises: ["squat", "bench press"],
            daysSinceCompleted: 3
        }, {
            name: "2",
            exercises: ["deadlift", "pull up"],
            daysSinceCompleted: 1
        },
    ]
    const navigate = useNavigate();
    const {state, dispatch} = useUser();
    
    
    return (
    <div className="workout-page">
        <div className="workout-page-header">
            
            <button className="start-workout-button" onClick={() => navigate("/workouts/workout")}>▶ Quick Start</button>
        </div>

        <div className="workout-templates">
            <h2 className="templates-label">My Templates</h2>
            <div className="template-grid">
                {testTemplates.map((template, index) => (
                    <div className="template-card" key={template.id || index}>
                        <div className="template-card-header">
                            <h2 className="template-name">{template.name}</h2>
                            <button className="template-edit-button">Edit</button>
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

                        <button className="template-start-button">▶ Start</button>
                    </div>
                ))}

                <button className="add-template-button">+ New Template</button>
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
                            <button className="template-edit-button">View</button>
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

                        <button className="template-start-button">↻ Repeat</button>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
}
export default Workouts;