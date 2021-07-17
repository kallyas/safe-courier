import { useEffect, useState } from "react";
import { Route, Redirect } from "react-router-dom";
import useToken from "../../Utils/useToken";

import { Preloader, Sidebar, Footer, Navbar } from "../index"
import { Routes } from "../../routes"

function ProtectedRouteWithSidebar({ component: Component, ...rest }) {
    const [loaded, setLoaded] = useState(false);
    const { token } = useToken()

    useEffect(() => {
      const timer = setTimeout(() => setLoaded(true), 1000);
      return () => clearTimeout(timer);
    }, []);
  
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
          <Sidebar />
          
          <main className="content">
            <Navbar token={token} />
            <Component {...props} />
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
