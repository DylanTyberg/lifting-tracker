import { useContext, createContext, useReducer, useState, useEffect, Children } from "react";
import { getCurrentUser, fetchUserAttributes} from "@aws-amplify/auth";

export const UserContext = createContext();

const savedState = JSON.parse(localStorage.getItem("userState"))

const initialState = savedState || {
    user: null,
}

const logoutState = {
    user: null,
}

const userReducer = (state, action) => {
    switch (action.type) {
        case "SET_USER":
            return {...state, user: action.payload}
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
                
                
                dispatch({ 
                    type: 'SET_USER', 
                    payload: {
                        userId: userAttributes.sub,
                        email: userAttributes.email,
                        username: currentUser.username,
                        ...userAttributes
                    }
                });
                
               
                
            } catch (error) {
                console.log('No existing session:', error);
                dispatch({ type: "LOGOUT" });
               
            } finally {
                // setIsLoading(false);
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