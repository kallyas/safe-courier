import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { Routes } from "./routes"

import useToken from "./Utils/useToken";

import Home from "./components/Home/Home";
import Landing from "./components/Landing/Landing";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import ProtectedRouteWithSidebar from "./components/Common/ProtectedRouteWithSidebar"
import PublicRoute from "./components/Common/PublicRoute";

import UserDashboard from "./pages/dashboard/UserDashboard"
import Transactions from "./pages/Transactions"
import Signin from "./pages/Signin";
import Signup from "./pages/signup"
import NotFound from "./pages/NotFound"
require('dotenv').config()

function App() {
  const { token } = useToken();
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path={Routes.LandingPage.path} >
          { token ? <Redirect to={Routes.UserDashboard.path} /> : <Landing />}
          </Route>
        <ProtectedRouteWithSidebar exact path={Routes.UserDashboard.path} component={UserDashboard} />
        <ProtectedRouteWithSidebar exact path={Routes.Transactions.path} component={Transactions}/>
        <ProtectedRouteWithSidebar exact path={Routes.Details.path} component={Transactions}/>
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
