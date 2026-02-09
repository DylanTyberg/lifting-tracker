import { useState } from "react";
import {signIn} from 'aws-amplify/auth';
import { useNavigate } from "react-router-dom";
import { useUser } from "../../Contexts/UserContext";
import { fetchUserAttributes } from "aws-amplify/auth";

const SignIn = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const {state, dispatch} = useUser();
    const [error, setError] = useState(null)

    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            await signIn({username, password})
            setMessage("sign in succesfull")
            const userAttributes = await fetchUserAttributes();

            dispatch({type: "SET_USER", payload: {
                userId: userAttributes.sub,
                email: userAttributes.email,
                ...userAttributes
            }})
            navigate("/")

        } catch (error) {
            console.log(error)
            setError(error.message || "Failed to sign in.")
        }
    }

    return (
        <div className="sign-up-page">
            {error && <div className="error-message">{error}</div>}
            <form className="sign-up-form" onSubmit={handleSignIn}>
                <h1 className="sign-up-title">Sign In</h1>

                <div className="form-group">
                    <label htmlFor="email" className="form-label">Email</label>
                    <div className="password-input-wrapper">
                        <input 
                            id="email"
                            className="form-input" 
                            type='email' 
                            placeholder="example@gmail.com" 
                            required 
                            onChange={(e) => {setUsername(e.target.value)}}
                        />
                    </div>
                </div>
                
                <div className="form-group">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="password-input-wrapper">
                        <input 
                            id="password"
                            className="form-input" 
                            type={'password'}
                            placeholder="Enter your password" 
                            required 
                            onChange={(e) => {setPassword(e.target.value)}}
                        />
                        
                    </div>
                </div>
            
            
            <button className="submit-button" type='submit'>Sign In</button>
             <p className="auth-switch">
                Don't have an account? <a href="/sign-up" className="auth-link">Sign Up</a>
            </p>
        </form>
    </div>
    )
}
export default SignIn;