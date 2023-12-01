import logo from './logo.svg';
import './App.scss';


import Login from './components/Login';
import HeaderNav from './components/HeaderNav';
import UserHome from './components/UserHome';
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

          <Route path='/userhome' element={<PrivateRoute authenticated={authenticated} />} >
            <Route exact path='/userhome' element={<UserHome />}></Route>
          </Route>

          <Route path='/usercheckin' element={<PrivateRoute authenticated={authenticated} />} >
            <Route exact path='/usercheckin' element={<CheckInPage />}></Route>
          </Route>

          <Route path='/queuelist' element={<PrivateRoute authenticated={authenticated} />} >
            <Route exact path='/queuelist' element={<QueueListPage />}></Route>
          </Route>

        </Routes>
        </Router>
    </div>
  );
}

export default App;
