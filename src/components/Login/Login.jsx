import { useState } from "react";
import { useHistory } from 'react-router-dom'

async function loginUser(credentials) {
  return fetch('http://localhost:8080/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })
    .then(data => data.json())
 }

const Login = ({setToken}) => {
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const history = useHistory()

  const handleSubmit = async e => {
    e.preventDefault();
    const token = await loginUser({
      username,
      password
    });
    setToken(token);
  }

return (
  <div className="page-inner login-page">
    <div id="main-wrapper" className="container-fluid">
        <div className="row">
          <div className="col-sm-6 col-md-3 login-box">
              <h4 className="login-title">Sign in to your account</h4>
                  <form onSubmit={handleSubmit}>
                      <div className="form-group">
                          <label for="username">Username</label>
                          <input 
                          type="text" 
                          className="form-control"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          />
                      </div>
                      <div className="form-group">
                          <label for="password">Password</label>
                          <input 
                          type="password" 
                          className="form-control" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}/>
                      </div>
                      <button 
                      type="submit" 
                      className="btn b btn-primary"
                      >Login</button>
                      <button 
                      className="btn b btn-default"
                      onClick={() => history.push('/signup')}
                      >Register Here</button>
                      <a href="/forgot-password" 
                      className="forgot-link"
                      onClick={() => history.push('/forgot-password')}>Forgot password?</a>
                  </form>
            </div>
          </div>
        </div>
    </div>
);}

export default Login;