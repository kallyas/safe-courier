import { useEffect, useState } from "react";
import { Route, Redirect } from "react-router-dom";
import decode from "jwt-decode"
import useToken from "../../Utils/useToken";

import { Preloader, Sidebar, Footer, Navbar } from "../index"
import { Routes } from "../../routes"
import AuthService from "../../service/AuthService"

function ProtectedRouteWithSidebar({ component: Component, ...rest }) {
    const [loaded, setLoaded] = useState(false);
    const { token } = useToken()
    const user = decode(token)

    useEffect(() => {
      const timer = setTimeout(() => setLoaded(true), 1000);
      if (token && decode(token)?.exp * 1000 < new Date().getTime()){
        AuthService.logout();
        return window.location.href = Routes.SignIn.path;
      }
      return () => clearTimeout(timer);
    }, [token]);
  
    const localStorageIsSettingsVisible = () => {
      return localStorage.getItem('settingsVisible') === 'false' ? false : true
    }
  
    const [showSettings, setShowSettings] = useState(localStorageIsSettingsVisible);
  
    const toggleSettings = () => {
      setShowSettings(!showSettings);
      localStorage.setItem('settingsVisible', !showSettings);
    }


  return (
    <Route
      {...rest}
      render={(props) =>
        token ? (
          <>
          <Preloader show={loaded ? false : true} />
          <Sidebar token={token} />
          
          <main className="content">
            <Navbar token={token} />
              <Component token={token} {...props} user={user}/>
            <Footer toggleSettings={toggleSettings} showSettings={showSettings} />
          </main>
          </>
        ) : (
          <Redirect
            to={{ pathname: Routes.SignIn.path, state: { from: props.location } }}
          />
        )
      }
    />
  );
}

export default ProtectedRouteWithSidebar;
