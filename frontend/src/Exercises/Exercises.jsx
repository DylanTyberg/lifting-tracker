import "../Exercises/Exercises.css"
const Exercises = () => {
    
    const testList = [
        {
            id: "exercise",
            name: "squat"
        },
        {
            id: "exercise",
            name: "squat"
        },
        {
            id: "exercise",
            name: "deadlift"
        },
        {
            id: "exercise",
            name: "bench press"
        },
        {
            id: "exercise",
            name: "pull up"
        },
    ]

    return (
    <div className="exercise-page">
        <div className="exercise-list">
            {testList.map((item, index) => (
                <div className="exercise-card" key={item.id || index}>
                    <div className="exercise-card-header">
                        <h2 className="exercise-name">{item.name}</h2>
                        {item.isPR && <span className="pr-badge">🏆 PR</span>}
                    </div>

                    <div className="exercise-stats">
                        <div className="stat-block">
                            <p className="stat-label">Last</p>
                            <span className="stat-value">{item.lastWeight ?? "--"} lbs</span>
                            <span className="stat-divider">×</span>
                            <span className="stat-value">{item.lastReps ?? "--"} reps</span>
                        </div>

                        <div className="stat-separator" />

                        <div className="stat-block">
                            <p className="stat-label">Best</p>
                            <span className="stat-value">{item.bestWeight ?? "--"} lbs</span>
                            <span className="stat-divider">×</span>
                            <span className="stat-value">{item.bestReps ?? "--"} reps</span>
                        </div>
                    </div>

                    <button className="log-button">+ Log Set</button>
                </div>
            ))}

            <button className="add-exercise-button">+ Add Exercise</button>
        </div>
    </div>
);
}
export default Exercises;