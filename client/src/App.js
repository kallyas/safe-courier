import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { Routes } from "./routes"

import "./App.css";
import "./assets/css/space.min.css";
import "./assets/css/toastr.min.css";

import useToken from "./Utils/useToken";

import Home from "./components/Home/Home";
import Signup from "./components/Signup/Signup";
import NotFound from "./components/Common/NotFound";
import Landing from "./components/Landing/Landing";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import PublicRoute from "./components/Common/PublicRoute";
import Signin from "./pages/Signin";

function App() {
  const { token } = useToken();
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path={Routes.LandingPage.path} >
          { token ? <Redirect to={Routes.UserDashboard.path} /> : <Landing />}
          </Route>
        <ProtectedRoute path={Routes.UserDashboard.path} component={Home} />
        <PublicRoute exact path={Routes.SignIn.path} component={Signin} />
        <PublicRoute exact path={Routes.SignUp.path} component={Signup} />
        <ProtectedRoute path="/add" component={Home}/>
        <ProtectedRoute path="/details/:id" component={Home} />
        <ProtectedRoute path="/edit/:id" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
