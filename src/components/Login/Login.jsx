import { useState, useEffect } from "react";
import { MDBContainer, MDBRow, MDBCol } from 'mdbreact';

const Login = ({ onClick }) => {
  const [password, setpassword] = useState("")
  const [email, setemail] = useState("")
  const [error, seterror] = useState([])


  useEffect(() => {
    if(!password && !email){
      seterror("All fields are required")
    }
  }, [email, password])

return (
  <MDBContainer>
  <MDBRow>
    <MDBCol md="6">
       <form action="">
       <p className="h4 text-center mb-4">Sign in</p>
        <label htmlFor="defaultFormLoginEmailEx" className="grey-text">
          Your email
        </label>
        <input 
        type="email" 
        id="defaultFormLoginEmailEx" 
        className="form-control" 
        value={email}
        onChange={(e) => setemail(e.target.value)}
        />
        <br />
        <label htmlFor="defaultFormLoginPasswordEx" className="grey-text">
          Your password
        </label>
        <input 
        type="password"
        id="defaultFormLoginPasswordEx" 
        className="form-control" 
        value={password}
        onChange={(e) => setpassword(e.target.value)}
        />
        <div className="text-center mt-4">
          <button onClick={onClick}>Login</button>
        </div>
       </form>
    </MDBCol>
  </MDBRow>
  </MDBContainer>
);
}

export default Login;