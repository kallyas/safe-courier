import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faEdit, faEllipsisH, faEye, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Nav, Card, Button, Table, Dropdown, Pagination, ButtonGroup } from '@themesberg/react-bootstrap';
import { Link } from 'react-router-dom';

import { Routes } from "../routes"

    const TransactionsTable = ({ items }) => {
    const TableRow = (props) => {
      const { _id, parcelType, sender, locationTo, trackingCode, createdAt, price, status } = props;
      const statusVariant = status === "delivered" ? "success"
        : status === "transit" ? "warning"
          : status === "cancelled" ? "danger" : "primary";
  
      return (
        <tr>
          <td>
            <Card.Link as={Link} className="fw-normal">
              {"#"}
            </Card.Link>
          </td>
          <td>
            <span className="fw-normal">
              {parcelType}
            </span>
          </td>
          <td>
            <span className="fw-normal">
              {sender.username}
            </span>
          </td>
          <td>
            <span className="fw-normal">
              {locationTo.length > 16 ? locationTo.substring(0, 16) + "..." : locationTo}
            </span>
          </td>
          <td>
            <span className="fw-normal">
              {trackingCode}
            </span>
          </td>
          <td>
            <span className="fw-normal">
              {new Date(createdAt).toDateString()}
            </span>
          </td>
          <td>
            <span className={`fw-normal text-${statusVariant}`}>
              {status}
            </span>
          </td>
          <td>
            <span className="fw-normal">
              {price}
            </span>
          </td>
          <td>
            <Dropdown as={ButtonGroup}>
              <Dropdown.Toggle as={Button} split variant="link" className="text-dark m-0 p-0">
                <span className="icon icon-sm">
                  <FontAwesomeIcon icon={faEllipsisH} className="icon-dark" />
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>
                  <Link to={{
                    pathname: `${Routes.Details.path}/${_id}`,
                    state: { item: props}
                  }} >
                  <FontAwesomeIcon icon={faEye} className="me-2" /> View Details
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                  <FontAwesomeIcon icon={faEdit} className="me-2" /> Edit
                </Dropdown.Item>
                <Dropdown.Item className="text-danger">
                  <FontAwesomeIcon icon={faTrashAlt} className="me-2" /> Remove
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </td>
        </tr>
      );
    };
  
    return (
      <Card border="light" className="table-wrapper table-responsive shadow-sm">
        <Card.Body className="pt-0">
          <Table hover className="user-table align-items-center">
            <thead>
              <tr>
                <th className="border-bottom">#</th>
                <th className="border-bottom">Type</th>
                <th className="border-bottom">Sender</th>
                <th className="border-bottom">Destination</th>
                <th className="border-bottom">Tracking Code</th>
                <th className="border-bottom">Date</th>
                <th className="border-bottom">Status</th>
                <th className="border-bottom">Price</th>
                <th className="border-bottom">Action</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((t, i) => <TableRow key={`transaction-${i}`} {...t} />)}
            </tbody>
          </Table>
          <Card.Footer className="px-3 border-0 d-lg-flex align-items-center justify-content-between">
            <Nav>
              <Pagination className="mb-2 mb-lg-0">
                <Pagination.Prev>
                  Previous
                </Pagination.Prev>
                <Pagination.Item active>1</Pagination.Item>
                <Pagination.Item>2</Pagination.Item>
                <Pagination.Item>3</Pagination.Item>
                <Pagination.Item>4</Pagination.Item>
                <Pagination.Item>5</Pagination.Item>
                <Pagination.Next>
                  Next
                </Pagination.Next>
              </Pagination>
            </Nav>
            <small className="fw-bold">
              Showing <b>{items.length}</b> out of <b>{items.length}</b> entries
            </small>
          </Card.Footer>
        </Card.Body>
      </Card>
    );
  };

  export default TransactionsTable