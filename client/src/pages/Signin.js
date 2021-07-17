
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Form, Card, Button, Container, InputGroup, Alert } from '@themesberg/react-bootstrap';
import { Link, useHistory } from 'react-router-dom';

import { Routes } from "../routes";
import AuthService from "../service/AuthService"
import useToken from "../Utils/useToken"



const  Signin = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState([])
  const { setToken } = useToken()
  const history = useHistory()
  const [data, setData] = useState({
    username: "",
    password: ""
  })

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    })
  }

  const submit = async (e) => {
    setLoading(true)
    e.preventDefault();
    const { token, message } = await AuthService.login(data)
    if(message !== "logged In") {
      setError([...error, message])
      setLoading(false)
      return
    }
    setLoading(false)
    setError([])
    setToken(token)
    history.push(Routes.UserDashboard.path)
  }

  return (
    <main>
      <section className="d-flex align-items-center my-5 mt-lg-6 mb-lg-5">
        <Container>
          <Row className="justify-content-center form-bg-image">
            <Col xs={12} className="d-flex align-items-center justify-content-center">
              <div className="bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100 fmxw-500">
                <div className="text-center text-md-center mb-4 mt-md-0">
                  <h3 className="mb-0" style={{ fontFamily: "Ubuntu" }}>Sign into your account</h3>
                </div>
                {error.length > 0 ? <Alert variant="danger">
                  {error.map(err => 
                    <ul key={err}>
                      <li>{err}</li>
                    </ul>
                  )}
                </Alert>
                : ""
              }
                <Form className="mt-4" onSubmit={submit}>
                  <Form.Group id="email" className="mb-4">
                    <Form.Label>Your Username</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faUser} />
                      </InputGroup.Text>
                      <Form.Control 
                      autoFocus 
                      required type="text"
                      name="username" 
                      placeholder="username" 
                      defaultValue={data.username}
                      onChange={handleChange}
                      />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group>
                    <Form.Group id="password" className="mb-4">
                      <Form.Label>Your Password</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faUnlockAlt} />
                        </InputGroup.Text>
                        <Form.Control 
                        required type="password" 
                        placeholder="Password"
                        name="password" 
                        defaultValue={data.password}
                        onChange={handleChange}
                        />
                      </InputGroup>
                    </Form.Group>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Card.Link className="small text-end">Lost password?</Card.Link>
                    </div>
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100">
                    { loading ? "Signing in..." : "Sign In"}
                  </Button>
                </Form>
                <div className="d-flex justify-content-center align-items-center mt-4">
                  <span className="fw-normal">
                    Not registered?
                    <Card.Link as={Link} to={Routes.SignUp.path} className="fw-bold">
                      {` Create account `}
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

export default Signin