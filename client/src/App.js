import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";

import "./App.css";
import "./assets/css/space.min.css";
import "./assets/css/toastr.min.css";

import useToken from "./Utils/useToken";

import Login from "./components/Login/Login";
import Home from "./components/Home/Home";
import Signup from "./components/Signup/Signup";
import NotFound from "./components/Common/NotFound";
import Landing from "./components/Landing/Landing";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import PublicRoute from "./components/Common/PublicRoute";

function App() {
  const { token } = useToken();
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" >
          { token ? <Redirect to="/home" /> : <Landing />}
          </Route>
        <ProtectedRoute path="/home" component={Home} />
        <PublicRoute path="/login" component={Login} />
        <PublicRoute path="/signup" component={Signup} />
        <ProtectedRoute path="/add" component={Home}/>
        <ProtectedRoute path="/details/:id" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
