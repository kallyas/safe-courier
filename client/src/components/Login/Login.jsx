import { useState } from "react";
import { useHistory } from 'react-router-dom'
import useToken from "../../Utils/useToken"

const Login = () => {
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [error, setError] = useState([])
  const history = useHistory()
  const { setToken } = useToken()

  const API = process.env.REACT_APP_API_URL

  const loginUser = async () => {
    const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({username, password})
  })

    const data = await res.json()
    return data
  }
  const handleSubmit = async e => {
    e.preventDefault();
    const {token, message} = await loginUser()
    console.log(message);

    if(message !== "logged In") {
      setError(message)
      return
    }
      setToken(token);
      history.push("/home")
      setError([])
  }

return (
  <div className="page-inner login-page">
    <div id="main-wrapper" className="container-fluid">
        <div className="row">
          <div className="col-sm-6 col-md-3 login-box">
              <h4 className="login-title">Sign in to your account</h4>
                  <form onSubmit={handleSubmit}>
                      <div className="form-group">
                          <label htmlFor="username">Username</label>
                          <input 
                          type="text" 
                          className="form-control"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          />
                          {error === "User not found!" && <p className="help-block" style={{ color: "red"}}>user does not exist</p>}
                      </div>
                      <div className="form-group">
                          <label htmlFor="password">Password</label>
                          <input 
                          type="password" 
                          className="form-control" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}/>
                          {error === "Passwords did not match!" && <p className="help-block" style={{ color: "red"}}>Incorect password</p>}
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