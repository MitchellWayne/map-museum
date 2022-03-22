import React from 'react';
import { HashRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute, ReversePrivateRoute } from './PrivateRoute';
import './App.css';
// import './index.css';

import Login from './Login';
import Client from './Client';

// Note for later
// import logo from './logo.svg';
// <img src={logo} className="App-logo" alt="logo" />

function App() {
  return (
    <div className="App flex flex-row items-center w-screen h-screen">
      <HashRouter basename="/">
        <Routes>
          <Route path = '/' element={ <ReversePrivateRoute><Login/></ReversePrivateRoute> }/>
          <Route path = '/client' element={ <PrivateRoute><Client/></PrivateRoute> }/>
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
