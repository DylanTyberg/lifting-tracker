import { useContext, createContext, useReducer, useState, useEffect, Children } from "react";
import { getCurrentUser, fetchUserAttributes} from "@aws-amplify/auth";

export const UserContext = createContext();

const savedState = JSON.parse(localStorage.getItem("userState"))

const initialState = savedState || {
    user: null,
    exercises: {},
    workouts: []
}

const logoutState = {
    user: null,
    exercises: {},
    workouts: []
}

const userReducer = (state, action) => {
    switch (action.type) {
        case "SET_USER":
            return {...state, user: action.payload}
        case "SET_EXERCISES":
            return {...state, exercises: action.payload}
        case "SET_WORKOUTS":
            return {...state, workouts: action.payload}
        case "ADD_EXERCISE_ENTRY":
            // Add a new workout entry to an existing exercise
            const { exerciseName, entry } = action.payload;
            return {
                ...state,
                exercises: {
                    ...state.exercises,
                    [exerciseName]: [
                        entry,
                        ...(state.exercises[exerciseName] || [])
                    ]
                }
            }
        case "ADD_WORKOUT":
            // Add a new workout to the beginning of the array (most recent first)
            return {
                ...state,
                workouts: [action.payload, ...state.workouts]
            }
        case "LOGOUT":
            return {...logoutState};
        default:
            return state;
    }
}

export const UserProvider = ({children}) => {
    const [state, dispatch] = useReducer(userReducer, initialState);
    
    useEffect(() => {
        localStorage.setItem("userState", JSON.stringify(state))
    }, [state])
    
    useEffect(() => {
        const checkExistingSession = async () => {
            try {
                const currentUser = await getCurrentUser();
                console.log('Found existing session:', currentUser);
                
                const userAttributes = await fetchUserAttributes();
                console.log('User attributes:', userAttributes);
                
                const userId = userAttributes.sub;
                
                dispatch({ 
                    type: 'SET_USER', 
                    payload: {
                        userId: userId,
                        email: userAttributes.email,
                        username: currentUser.username,
                        ...userAttributes
                    }
                });
                
                // Fetch exercises after setting user
                const exercisesResponse = await fetch(`http://localhost:3000/user/exercises/${userId}`);
                if (exercisesResponse.ok) {
                    const exercisesData = await exercisesResponse.json();
                    dispatch({
                        type: 'SET_EXERCISES',
                        payload: exercisesData.exercises
                    });
                }

                // Fetch workouts after setting user
                const workoutsResponse = await fetch(`http://localhost:3000/user/workouts/${userId}`);
                if (workoutsResponse.ok) {
                    const workoutsData = await workoutsResponse.json();
                    dispatch({
                        type: 'SET_WORKOUTS',
                        payload: workoutsData.workouts
                    });
                }
                
            } catch (error) {
                console.log('No existing session:', error);
                dispatch({ type: "LOGOUT" });
            } 
        };

        checkExistingSession();
    }, []);

    return (
        <UserContext.Provider value={{state, dispatch}}>
            {children}
        </UserContext.Provider>
    )
}
export const useUser = () => {
    const context = useContext(UserContext);
    return context;
}