/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCog, faHome, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Col, Row, Form, Button, ButtonGroup, Breadcrumb, InputGroup, Dropdown, Card } from '@themesberg/react-bootstrap';
import { Progress } from "../components";
import { ParcelService } from "../service/ParcelService"


// create arrow functional component and export default
const ParcelDetails = ({ token }) => {
    const [item, setItem] = useState(null)
    const { state } = useLocation()
    const statusVariant = state.item.status === "delivered" ? "success"
    : state.item.status === "transit" ? "warning"
      : state.item.status === "cancelled" ? "danger" : "primary";

    console.log(state)
    // useEffect to fetch parcel by Id using ParcelService
    useEffect(() => {
        const getParcel = async () => {
          const res = await ParcelService.getParcel(state.item._id, token)
          setItem(res)
        }
        getParcel()
    }, [state.item._id, token])
  
    return (
        <>
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
            <div className="d-block mb-4 mb-md-0">
                <Breadcrumb className="d-none d-md-inline-block" listProps={{ className: "breadcrumb-dark breadcrumb-transparent" }}>
                    <Breadcrumb.Item><FontAwesomeIcon icon={faHome} /></Breadcrumb.Item>
                    <Breadcrumb.Item>Courier</Breadcrumb.Item>
                    <Breadcrumb.Item active>Details</Breadcrumb.Item>
                </Breadcrumb>
            <h4>Parcel Details</h4>
            <p className="mb-0">{ item?.trackingCode }</p>
            </div>
            <div className="btn-toolbar mb-2 mb-md-0">
                <ButtonGroup>
                    <Button variant="outline-primary" size="sm">Share</Button>
                    <Button variant="outline-primary" size="sm">Export</Button>
                </ButtonGroup>
            </div>
        </div>
        <Row>
        <Col xs={12} xl={12} className="mb-4">
          <Row>
            <Col xs={12} xl={7} className="mb-4">
              <Row>
                <Col xs={12} className="mb-4">
                  <Card border="light" className="mb-4">
                  <Card.Header>
                    <Row className="align-items-center">
                      <Col>
                        {/* <h5>Status: {item?.status.charAt(0).toUpperCase() + item.status.slice(1)}</h5> */}
                      </Col>
                      <Col className="text-end">
                        Updated: { new Date(item.createdAt).toDateString() }
                      </Col>
                    </Row>
                    </Card.Header>
                    <Card.Body>
                       <Progress variant={statusVariant} label={item.status} value={56} />
                       <Col xs={12} className="mb-4">
                         <Row>
                          <Col xs={12} xl={8}>
                           <h6>Scheduled Delivery</h6>
                           {new Date().toLocaleString()}
                          </Col>
                          <Col xs={12} xl={4}>
                           <h6>Estimated time</h6>
                           By the end of the day
                          </Col>
                         </Row>
                       </Col>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>

            <Col xs={12} xl={5}>
              <Row>
                <Col xs={12} className="mb-4">
                 <Card border="light" shadow="sm">
                   <Card.Header>
                     <div className="d-block">
                       <h6 className="fw-normal text-gray mb-2">
                           <b>Shipping To:</b><br /> <br />
                           { item.locationTo }
                       </h6>
                       <h6 className="fw-normal text-gray mb-2">
                           <b>Shipping From: </b> 
                           { item.locationFrom }
                       </h6>
                       <h6 className="fw-normal text-gray mb-1">
                           <b>From: </b> 
                           { item.sender.username }
                       </h6>
                       <h6 className="fw-normal text-gray mb-1">
                           <b>To: </b> 
                           { item.recipient.name }
                       </h6>
                       <h6 className="fw-normal text-gray mb-1">
                           <b>Price: </b> 
                           { item.price }
                       </h6>
                       <h6 className="fw-normal text-gray mb-1">
                           <b>Weight: </b> 
                           { item.weight }
                       </h6>
                     </div>
                   </Card.Header>
                 </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
        </>
    )
}

export default ParcelDetails