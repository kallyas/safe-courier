import { Route, Redirect } from "react-router-dom";
import useToken from "../../Utils/useToken";

function ProtectedRoute({ component: Component, ...rest }) {
  const { token } = useToken();
  return (
    <Route
      {...rest}
      render={(props) =>
        token ? (
          <Component {...props} />
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
