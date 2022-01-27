/* eslint-disable no-unused-vars */
/* eslint-disable import/no-anonymous-default-export */
import { useState, useEffect } from 'react'
import { Col, Row } from '@themesberg/react-bootstrap';
import { ChoosePhotoWidget } from "../components/Widgets";
import { ParcelForm } from "../components/ParcelForm";

import Profile3 from "../assets/images/profile-picture-3.jpg";
import { OrderSummary } from '../components/index';


export default ({ token, user }) => {
  return (
    <>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div className="d-flex">
        </div>
      </div>

      <Row>
        <Col xs={12} xl={8}>
          <ParcelForm token={token} user={user}/>
        </Col>

        <Col xs={12} xl={4}>
          <Row>
            <Col xs={12}>
              <OrderSummary />
            </Col>
            <Col xs={12}>
             {/* {} */}
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};
