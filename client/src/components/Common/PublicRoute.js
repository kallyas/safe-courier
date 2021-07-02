import { useState, useEffect} from 'react';
import { Route, Redirect } from 'react-router-dom';
import useToken from '../../Utils/useToken';

import { Preloader } from "../index"
import { Routes } from "../../routes"

// handle the public routes
function PublicRoute({ component: Component, ...rest }) {
  const [loaded, setLoaded] = useState(false);
  const { token } = useToken();

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <Route
      {...rest}
      render={(props) => !token ? (
        <>
        <Preloader show={loaded ? false : true} />
      <Component {...props} />
      </>
      ) : 
      <Redirect to={{ pathname: Routes.UserDashboard.path }} />
    }
    />
  )
}

export default PublicRoute;