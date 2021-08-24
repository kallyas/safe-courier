import { useState, useEffect } from 'react'
import { Card } from '@themesberg/react-bootstrap';


const OrderSummary = () => {
  const [data, setData] = useState(JSON.parse(localStorage.getItem('data')))
  const dataStr = localStorage.getItem('data')
  useEffect(() => {
    setData(JSON.parse(localStorage.getItem('data')))
  }, [dataStr])
    return (
      <Card border="light" className="text-center p-0 mb-4">
        <Card.Body className="pb-5">    
          <Card.Title>Order Summary</Card.Title>
          {/* <Card.Subtitle className="fw-normal">your order in summary</Card.Subtitle> */}
          <Card.Text className="text-gray mb-4">Names: { data?.recipient.name }</Card.Text>
        </Card.Body>
      </Card>
    );
  };

  export default OrderSummary