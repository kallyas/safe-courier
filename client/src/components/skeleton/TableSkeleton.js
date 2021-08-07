import { Card,Table } from '@themesberg/react-bootstrap';
import Skeleton from "react-loading-skeleton";


    const TableSkeleton = () => {
    const TableRow = () => { 
      return (
        <tr>
          <td>
            <Card className="fw-normal">
              <Skeleton />
            </Card>
          </td>
          <td>
            <span className="fw-normal">
             <Skeleton />
            </span>
          </td>
          <td>
            <span className="fw-normal">
              <Skeleton />
            </span>
          </td>
          <td>
            <span className="fw-normal">
              <Skeleton />
            </span>
          </td>
          <td>
            <span className="fw-normal">
              <Skeleton />
            </span>
          </td>
          <td>
            <span className="fw-normal">
              <Skeleton />
            </span>
          </td>
          <td>
            <span className="fw-normal text">
              <Skeleton />
            </span>
          </td>
          <td>
            <span className="fw-normal">
              <Skeleton />
            </span>
          </td>
          <td>
            <Skeleton />
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
              {Array(9).fill().map((t, i) => <TableRow key={`transaction-${i}`} {...t} />)}
            </tbody>
          </Table>
          <Card.Footer className="px-3 border-0 d-lg-flex align-items-center justify-content-between">
            <Skeleton />
          </Card.Footer>
        </Card.Body>
      </Card>
    );
  };

  export default TableSkeleton
