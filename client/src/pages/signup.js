
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUnlockAlt, faUser } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Form, Card, Button, FormCheck, Container, InputGroup, Alert } from '@themesberg/react-bootstrap';
import { Link, useHistory } from 'react-router-dom';

import { Routes } from "../routes";
import AuthService from "../service/AuthService"
import useToken from "../Utils/useToken"


const Signup =  () => {
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState([])
  const { setToken } = useToken()
  const history = useHistory()
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  })

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value.toLowerCase().trim()
    })
  }


  const submit = async (e) => {
    setLoading(true)
    setError([])
    e.preventDefault();
    const res = await AuthService.signUp(data)
    if(res.message !== "User created successfully") {
      setError([res.message])
      setLoading(false)
      return
    }

    setLoading(false)
    setError([])
    setToken(res.token)
    history.push(Routes.UserDashboard.path)
  }
  return (
    <main>
      <section className="d-flex align-items-center my-5 mt-lg-6 mb-lg-5">
        <Container>
          <Row className="justify-content-center form-bg-image">
            <Col xs={12} className="d-flex align-items-center justify-content-center">
              <div className="mb-4 mb-lg-0 bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100 fmxw-500">
                <div className="text-center text-md-center mb-4 mt-md-0">
                  <h3 className="mb-0" style={{ fontFamily: "Ubuntu"}}>Create an account</h3>
                </div>
                {error.length > 0 ? <Alert variant="danger">
                  { error }
                </Alert>
                : ""
              }
                <Form className="mt-4" onSubmit={submit}>
                <Form.Group id="username" className="mb-4">
                    <Form.Label>Username</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faUser} />
                      </InputGroup.Text>
                      <Form.Control 
                      name="username"
                      autoFocus 
                      required type="text"
                       placeholder="username"
                       defaultValue={data.username}
                       onChange={handleChange} 
                       />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group id="firstname" className="mb-4">
                    <Form.Label>First Name</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faUser} />
                      </InputGroup.Text>
                      <Form.Control 
                      autoFocus
                      name="firstName" 
                      required type="text"
                       placeholder="firstname"
                       defaultValue={data.firstName}
                       onChange={handleChange} 
                       />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group id="lastname" className="mb-4">
                    <Form.Label>Last Name</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faUser} />
                      </InputGroup.Text>
                      <Form.Control
                      name="lastName" 
                      autoFocus 
                      required type="text"
                       placeholder="last Name"
                       defaultValue={data.lastName}
                       onChange={handleChange} 
                       />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group id="email" className="mb-4">
                    <Form.Label>Your Email</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faEnvelope} />
                      </InputGroup.Text>
                      <Form.Control
                      name="email" 
                      autoFocus 
                      required 
                      type="email" 
                      placeholder="example@company.com" 
                      defaultValue={data.username}
                      onChange={handleChange}
                       />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group id="password" className="mb-4">
                    <Form.Label>Your Password</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faUnlockAlt} />
                      </InputGroup.Text>
                      <Form.Control
                      name="password" 
                      required 
                      type="password" 
                      placeholder="Password" 
                      defaultValue={data.password}
                      onChange={handleChange}
                      />
                    </InputGroup>
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100">
                    {loading ? "Signing up...": "Signup"}
                  </Button>
                </Form>
                <div className="d-flex justify-content-center align-items-center mt-4">
                  <span className="fw-normal">
                    Already have an account?
                    <Card.Link as={Link} to={Routes.SignIn.path} className="fw-bold">
                      {` Login here `}
                    </Card.Link>
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
};

export default Signup