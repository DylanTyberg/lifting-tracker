import { Fragment } from "react/jsx-runtime";
import { Outlet, Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "../NavigationBar/NavigationBar.css"
import { useUser } from "../Contexts/UserContext";
import { signOut } from "aws-amplify/auth";

const NavigationBar = () => {
    
    const location = useLocation();
    const {state, dispatch} = useUser();

    const handleSignOut = async (e) => {
        e.preventDefault();
        await signOut();
        dispatch({type: "LOGOUT"})
    }

    return ( 
    
        <Fragment >
            <div className="nav-bar">
                <div className="nav-spacer"></div>
                <div className="links">
                    <Link className={location.pathname === "/" ? "navbar-link-active" : "navbar-link"} to="/">
                        Home
                    </Link>
                    
                    <Link className={location.pathname.startsWith("/exercises") ? "navbar-link-active" : "navbar-link"} to="/exercises">
                        Exercises
                    </Link>

                    <Link className={location.pathname.startsWith("/Workouts") ? "navbar-link-active" : "navbar-link"} to="/workouts">
                        Workouts
                    </Link>

                </div>
                <div className="sign-in-button">
                    {!state.user && <Link className={"navbar-link-sign-in"} to="/sign-in">
                        Sign In
                    </Link>}
                    {state.user && <Link className={"navbar-link-sign-in"} onClick={handleSignOut}  to="#">
                        Sign Out
                    </Link>}
                    {!state.user && <Link className={"navbar-link-sign-up"} to="/sign-up">
                        Sign Up
                    </Link>}
                </div>
                    
            </div>
            <Outlet/>
        </Fragment>
        
    )
}
export default NavigationBar;