import logo from './logo.svg';
import './App.css';


import Login from './components/Login';
import HeaderNav from './components/HeaderNav';

//Import modules
import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
  Outlet
} from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from 'react';

import { auth } from './services/firebase';

function PrivateRoute({authenticated}) {
  return (
    authenticated === true ? (
      <>
      {/* pass globalstate only for headerNav */}
      <GlobalState><HeaderNav /></GlobalState> 
      <Outlet />
      </>
    )
   : (
    <Navigate
      to={{pathname:"/"}}
      />
  )
  );
}

function PublicRoute({authenticated}) {
  return (
    authenticated === false ? (
      <Outlet />
    ) : (
      <Navigate to="/userhome" />
    )
  );
}

function App() {

  //Define states
  const [authenticated, setAuthenticated] = useState(false);

  useEffect( () => {

    onAuthStateChanged(auth, (user) => {
      if(user){
        setAuthenticated(true)
      }else {
        setAuthenticated(false)
      }
    })
  }, []);



  return (
    <div className="App">
      <Router>
        <Routes>

          <Route exact path='/' element={<PublicRoute authenticated={authenticated} />} >
            <Route exact path='/' element={<Login />}></Route>
          </Route>

          <Route path='/userhome' element={<PrivateRoute authenticated={authenticated} />} >
            <Route exact path='/userhome' element={<QuestionPage />}></Route>
          </Route>

        </Routes>
        </Router>
    </div>
  );
}

export default App;
