/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import { Col, Row, Card, Form, Button } from '@themesberg/react-bootstrap';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { ParcelService } from "../service/ParcelService";

const customButton = withReactContent(Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-primary me-3'
  },
  buttonsStyling: false
}))

export const ParcelForm = ({ token, user }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false);
  const [name, setName] = useState({ firstName: '', lastName: ''})
  const [data, setData] = useState({
    email: '',
    locationTo: '',
    locationFrom: '',
    city: '',
    parcelType: '',
    weight: '',
  })

  const handleName = (e) => {
    setName({...name, [e.target.name]: e.target.value})
  }

  const handleChange = (e) => {
    setData({...data, [e.target.name]: e.target.value})
  }

  const finalData = {
    recipient: {name: name.firstName + ' ' + name.lastName, email: data.email},
    sender: user._id,
    price: "$".concat(parseInt(data.weight * 100).toString()),
    trackingCode: "LK".concat(Math.random().toString(36).slice(2, 7).toUpperCase()),
    locationFrom: data.locationFrom,
    locationTo: data.locationTo,
    weight: data.weight,
    city: data.city,
    parcelType: data.parcelType
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await ParcelService.createParcel(token, finalData)
    console.log(res)
    customButton.fire(res.status, res.message, 'success')
    setLoading(false)
  }
  useEffect(() => {
    localStorage.setItem('data', JSON.stringify(finalData))
  }, [data, name])

  return (
    <Card border="light" className="bg-white shadow-sm mb-4">
      <Card.Body>
        <h5 className="mb-4">Reciever information</h5>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group id="firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control 
                required type="text" 
                placeholder="Enter recepient first name"
                name="firstName"
                defaultValue={name.firstName}
                onChange={handleName}
                 />
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group id="lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control required type="text" 
                placeholder="Enter recepient last name"
                name="lastName"
                defaultValue={name.lastName}
                onChange={handleName}
                 />
              </Form.Group>
            </Col>
          </Row>
          <Row className="align-items-center">
            <Col md={6} className="mb-3">
              <Form.Group id="weight">
                <Form.Label>Weight</Form.Label>
                <Form.Control required type="number" placeholder="weight"
                name="weight"
                defaultValue={setData.weight}
                onChange={handleChange}
                 />
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group id="weight">
                <Form.Label>Courier Type</Form.Label>
                <Form.Select defaultValue="0"
                name="parcelType"
                onChange={handleChange}
                >
                  <option value="0">Courier Type</option>
                  <option value="parcel">Parcel</option>
                  <option value="shipping">shipping</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group id="emal">
                <Form.Label>Email</Form.Label>
                <Form.Control required type="email" 
                placeholder="name@company.com"
                name="email"
                defaultValue={data.email}
                onChange={handleChange}
                 />
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group id="phone">
                <Form.Label>Phone</Form.Label>
                <Form.Control required type="number"
                placeholder="+12-345 678 910" 
                name="phone"
                defaultValue={data.phone}
                onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <h5 className="my-4">Address</h5>
          <Row>
            <Col sm={6} className="mb-3">
              <Form.Group id="address">
                <Form.Label>Address</Form.Label>
                <Form.Control required type="text" 
                placeholder="Enter Recipient address"
                name="locationTo"
                defaultValue={data.locationTo}
                onChange={handleChange}
                 />
              </Form.Group>
            </Col>
            <Col sm={6} className="mb-3">
              <Form.Group id="addressNumber">
                <Form.Label>Sender Address</Form.Label>
                <Form.Control required type="text" placeholder="No."
                name="locationFrom"
                defaultValue={data.locationFrom}
                onChange={handleChange} 
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col sm={4} className="mb-3">
              <Form.Group id="city">
                <Form.Label>City</Form.Label>
                <Form.Control required type="text" placeholder="City"
                name="city"
                defaultValue={data.city}
                onChange={handleChange}
                 />
              </Form.Group>
            </Col>
            <Col sm={4} className="mb-3">
              <Form.Group className="mb-2">
                <Form.Label>Select state</Form.Label>
                <Form.Select id="state" defaultValue="0">
                  <option value="0">State</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <div className="mt-3">
            <Button variant="primary" type="submit">
              { loading ? "creating order...": "create order"}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};
