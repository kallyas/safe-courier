import Skeleton from "react-loading-skeleton"

import { Col, Row, Card } from '@themesberg/react-bootstrap';
const DetailsSkeleton = () => {

    return (
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
                        <h5><Skeleton /></h5>
                      </Col>
                      <Col className="text-end">
                        <Skeleton />
                      </Col>
                    </Row>
                    </Card.Header>
                    <Card.Body>
                       <Col xs={12} className="mb-4">
                         <Row>
                          <Col xs={12} xl={8}>
                           <h6><Skeleton /></h6>
                           <Skeleton count={4} />
                          </Col>
                          <Col xs={12} xl={4}>
                           <h6><Skeleton /></h6>
                           <Skeleton count={4}/>
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
                           <b><Skeleton /></b><br /> <br />
                           <Skeleton count={2} />
                       </h6>
                       <h6 className="fw-normal text-gray mb-2">
                           <b><Skeleton /> </b> 
                           <Skeleton count={2} />
                       </h6>
                       <h6 className="fw-normal text-gray mb-1">
                           <b><Skeleton /></b> 
                           <Skeleton />
                       </h6>
                       <h6 className="fw-normal text-gray mb-1">
                           <b><Skeleton /></b> 
                           <Skeleton />
                       </h6>
                       <h6 className="fw-normal text-gray mb-1">
                           <b><Skeleton /> </b> 
                           <Skeleton />
                       </h6>
                       <h6 className="fw-normal text-gray mb-1">
                           <b><Skeleton /></b> 
                           <Skeleton />
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
    )
}

export default DetailsSkeleton