import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";

import './App.css'
import './assets/css/space.min.css'

import useToken  from './Utils/useToken'

import Login from "./components/Login/Login";
import Home from './components/Home/Home'
import Signup from './components/Signup/Signup';
import NotFound from './components/Common/NotFound'
import Landing from './components/Landing/Landing';

function App() {
  const { token, setToken } = useToken()
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
            <Landing />
        </Route>
        <Route exact path="/home">
            {token ? <Home /> : <Redirect to="/login" />}
        </Route>
        <Route exact path="/login">
          {token ? <Redirect to="/" /> : <Login setToken={setToken}  />}
        </Route>
        <Route exact path="/signup">
            {token ? <Redirect to="/" /> : <Signup />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
