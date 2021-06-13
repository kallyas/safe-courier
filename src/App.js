import { useState } from 'react'
import { MDBContainer } from 'mdbreact'
import { BrowserRouter, Switch, Route } from "react-router-dom";
import './App.css'
import Login from "./components/Login/Login";
import Home from './components/Home/Home'
import Signup from './components/Signup/Signup';
import NotFound from './components/Common/NotFound'

function App() {
  const [isLoggedIn, setisLoggedIn] = useState(false)

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <MDBContainer>
            {isLoggedIn ? <Home /> : <Login onClick={() => setisLoggedIn(true)} />}
          </MDBContainer>
        </Route>
        <Route exact path="/signup">
          <MDBContainer>
            <Signup />
          </MDBContainer>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
