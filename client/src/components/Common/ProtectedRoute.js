import { useEffect, useState } from "react";
import { Route, Redirect } from "react-router-dom";
import useToken from "../../Utils/useToken";

import { Preloader } from "../index"

function ProtectedRoute({ component: Component, ...rest }) {
  const [loaded, setLoaded] = useState(false);
  const { token } = useToken();

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Route
      {...rest}
      render={(props) =>
        token ? (
          <>
          <Preloader show={loaded ? false : true} />
          <Component {...props} />
          </>
        ) : (
          <Redirect
            to={{ pathname: "/login", state: { from: props.location } }}
          />
        )
      }
    />
  );
}

export default ProtectedRoute;
