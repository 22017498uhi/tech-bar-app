import logo from './logo.svg';
import './App.scss';
import 'remixicon/fonts/remixicon.css'


import Login from './components/Login';
import HeaderNav from './components/HeaderNav';

import QueueListPage from './components/QueueListPage';
import GlobalState from './context/GlobalState';

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
import CheckInPage from './components/CheckInPage';
import Home from './components/Home';
import SurveyPage from './components/SurveyPage';

function PrivateRoute({authenticated}) {
  return (
    authenticated === true ? (
      <>
      {/* show header only for Home page */}
      <GlobalState> {window.location.pathname == "/home" ? ( <HeaderNav />): null }
      <Outlet /></GlobalState>
      </>
    )
   : (
    <Navigate
      to={{pathname:"/"}}
      />
  )
  );
}

function PrivateRouteNoHeader({authenticated}) {
  return (
    authenticated === true ? (
      <>
      {/* pass globalstate only for headerNav */}
      <GlobalState><HeaderNav /> 
      <Outlet /></GlobalState>
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
      <Navigate to="/home" />
    )
  );
}

function App() {

  //Define states
  const [authenticated, setAuthenticated] = useState(false);




  useEffect( () => {

    onAuthStateChanged(auth, (user) => {

      console.log('auth state chagned');
      console.log(user);

      if(user){
        console.log('autheedaacr')
        setAuthenticated(true)
      }else {
        console.log('false login');
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

          <Route path='/home' element={<PrivateRoute authenticated={authenticated} />} >
            <Route exact path='/home' element={<Home />}></Route>
          </Route>

          <Route path='/usercheckin' element={<PrivateRoute authenticated={authenticated} />} >
            <Route exact path='/usercheckin' element={<CheckInPage />}></Route>
          </Route>

          <Route path='/queuelist' element={<PrivateRoute authenticated={authenticated} />} >
            <Route exact path='/queuelist' element={<QueueListPage />}></Route>
          </Route>

          <Route path='/survey' element={<PrivateRoute authenticated={authenticated} />} >
            <Route exact path='/survey' element={<SurveyPage />}></Route>
          </Route>

          

        </Routes>
        </Router>
    </div>
  );
}

export default App;
