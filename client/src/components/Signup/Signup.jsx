import { useState } from "react";
import { useHistory } from "react-router-dom"
import { Loading } from "elementz"
import useToken from "../../Utils/useToken"

const Signup = () => {
  const [username, setUsername] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState([])
  const [loading, setLoading] = useState(false)
  const history = useHistory()
  const { setToken } = useToken()

  const API = process.env.REACT_APP_API_URL
  const signUpUser = async () => {
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        email,
        password,
        firstName,
        lastName
      })
    })
      
    const data = await res.json()
    console.log(data);
    return data
   }

  const handleSubmit = async e => {
    setLoading(true)
    e.preventDefault();
    const res = await signUpUser()
    if(res.message !== "User created successfully") {
      setError(res.message)
      setLoading(false)
      return
    }
    setToken(res.token)
    history.push("/home")
  }

return (
  <div className="page-inner login-page">
    <div id="main-wrapper" className="container-fluid">
      <div className="row">
        <div className="col-sm-6 col-md-3 login-box">
            <h4 className="login-title">Create an account</h4>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" 
                    className="form-control"
                    value={username}
                    required
                    onChange={(e) => setUsername(e.target.value)} />
                    
                </div>
                <div className="form-group">
                    <label htmlFor="FirstName">First name</label>
                    <input type="text" 
                    className="form-control"
                    value={firstName}
                    required
                    onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="LastName">Last name</label>
                    <input type="text" 
                    className="form-control"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div className="form-group">
                      <label htmlFor="Email">Email address</label>
                      <input type="email" 
                        className="form-control"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)} />
                        {error === "Email already exists" && <p style={{ color: "red"}} className="help-text">{error}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" 
                    className="form-control"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)} />
                </div>
                {loading && <Loading primary lg />}
                  <button type="submit" 
                  className={`btn b btn-primary ${loading ? "disabled" : ""}`}>
                    {loading ? "Registering..." : "Register"}
                  </button>
                  <button 
                  className="btn b btn-default"
                  onClick={() => history.push('/login')}>Login</button><br />
                  </form>
              </div>
          </div>
      </div>
    </div>
);
};

export default Signup;