import './App.css';
import {Routes, Route} from "react-router-dom"
import NavigationBar from './NavigationBar/NavigationBar';
import Home from './Home/home';
import SignUp from './Authentication/SignUp/SignUp';
import ConfirmEmail from './Authentication/ConfirmEmail/ConfirmEmail';
import SignIn from './Authentication/SignIn/SignIn';
import Exercises from './Exercises/Exercises';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<NavigationBar/>}>
          <Route index element={<Home/>}/>
          <Route path='exercises' element={<Exercises/>}/>
        </Route>
        <Route path="sign-up" element={<SignUp/>}/>
        <Route path="sign-in" element={<SignIn/>}/>
        <Route path="confirm-email" element={<ConfirmEmail/>}/>
      </Routes>
    </div>
  );
}

export default App;
