import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import useToken from '../../Utils/useToken';

// handle the public routes
function PublicRoute({ component: Component, ...rest }) {
    const { token } = useToken()
  return (
    <Route
      {...rest}
      render={(props) => !token ? <Component {...props} /> : <Redirect to={{ pathname: '/home' }} />}
    />
  )
}

export default PublicRoute;