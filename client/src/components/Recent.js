import { Link } from 'react-router-dom';
import { Col, Row, Card, Button, Table } from '@themesberg/react-bootstrap';

import { Routes } from "../routes"

const Recent = ({ items, loading }) => {
    const TableRow = (props) => {
        const { parcelType, createdAt, price, status } = props;
        const statusVariant = status === "delivered" ? "success"
        : status === "transit" ? "warning"
          : status === "cancelled" ? "danger" : "primary";
  
      return (
        <tr>
          <th scope="row">{parcelType}</th>
          <td>{new Date(createdAt).toDateString()}</td>
          <td>
            <span className={`fw-normal text-${statusVariant}`}>
              {status}
            </span>
          </td>
          <td>{price}</td>
        </tr>
      );
    };
  
    return (
      <Card border="light" className="shadow-sm">
        <Card.Header>
          <Row className="align-items-center">
            <Col>
              <h5>Latest Parcel Orders</h5>
            </Col>
            <Col className="text-end">
              <Link to={{ pathname: Routes.Transactions.path }}>
              <Button variant="secondary" size="sm">See all</Button>
              </Link>
            </Col>
          </Row>
        </Card.Header>
        <Table responsive className="align-items-center table-flush">
          <thead className="thead-light">
            <tr>
              <th scope="col">Courier Type</th>
              <th scope="col">Date</th>
              <th scope="col">Status</th>
              <th scope="col">Price</th>
            </tr>
          </thead>
          <tbody>
            {!loading ?
            (
              <>
              {items?.map(item => <TableRow key={`page-visit-${item._id}`} {...item} />)}
            </>
            )
            :
            (<>
              <tr>
              <td colSpan="4">Loading...</td>
              </tr>
            </>)
          }
          </tbody>
        </Table>
      </Card>
    );
  };

export default Recent;