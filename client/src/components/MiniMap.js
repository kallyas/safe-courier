
//import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Card } from "@themesberg/react-bootstrap"

const MiniMap = () => {

    return (
        <Card border="light" className="shadow-sm">
            <Card.Body className="d-flex flex-row align-items-center flex-0 border-bottom">
                <div className="d-block">
                <h6 className="fw-normal text-gray mb-2">Shipping</h6>
                    Map here
                </div>
            </Card.Body>
        </Card>
    )
}

export default MiniMap;