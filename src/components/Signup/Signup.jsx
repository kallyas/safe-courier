import { useState } from "react";
import { useHistory } from "react-router-dom"

async function signUpUser(data) {
  return fetch('http://localhost:8080/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(data => data.json())
 }

const Signup = () => {
  const [username, setUsername] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const history = useHistory()

  const handleSubmit = async e => {
    e.preventDefault();
    const token = await signUpUser({
      username,
      password
    });
    console.log(token);
  }

return (
  <div className="page-inner login-page">
    <div id="main-wrapper" className="container-fluid">
      <div className="row">
        <div className="col-sm-6 col-md-3 login-box">
            <h4 className="login-title">Create an account</h4>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label for="username">Username</label>
                    <input type="text" 
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="form-group">
                    <label for="FirstName">First name</label>
                    <input type="text" 
                    className="form-control"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="form-group">
                    <label for="LastName">Last name</label>
                    <input type="text" 
                    className="form-control"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div className="form-group">
                      <label for="Email">Email address</label>
                      <input type="email" 
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                    <label for="password">Password</label>
                    <input type="password" 
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} />
                </div>
                  <button type="submit" 
                  className="btn b btn-primary">Register</button>
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