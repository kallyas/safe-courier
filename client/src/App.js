import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { Routes } from "./routes"

import useToken from "./Utils/useToken";

import Landing from "./components/Landing/Landing";
import ProtectedRouteWithSidebar from "./components/Common/ProtectedRouteWithSidebar"
import PublicRoute from "./components/Common/PublicRoute";

import { 
  UserDashboard, 
  Transactions, 
  Signin, Signup, 
  NotFound, 
  ParcelDetails,
  Settings,
  Schedule,
 } from "./pages/index"
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
        <ProtectedRouteWithSidebar path={`${Routes.Details.path}/:id`} component={ParcelDetails}/>
        <ProtectedRouteWithSidebar path={Routes.Settings.path} component={Settings}/>
        <ProtectedRouteWithSidebar path={Routes.Schedule.path} component={Schedule}/>
        <PublicRoute exact path={Routes.SignIn.path} component={Signin} />
        <PublicRoute exact path={Routes.SignUp.path} component={Signup} />
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
