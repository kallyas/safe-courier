import React from 'react'
import { MDBCard, MDBRow, MDBCol } from 'mdbreact';
import './Mapoverlay.css'

function MapOverlay() {
    return (
        <MDBRow>
            <MDBCol>
                <MDBCard className="card-overlay">
                    <MDBRow className="card-overlay-details">
                        <p>SENDER</p>
                        <p>Valera Meladze</p>
                        <small>Linkoln St34/a, London</small>
                    </MDBRow>
                    <MDBRow className="card-overlay-details">
                        <p>Reciever</p>
                        <p>Tom Hardy</p>
                        <small>Linkoln St34/a, London</small>
                    </MDBRow>
                </MDBCard>
            </MDBCol>
        </MDBRow>
    )
}

export default MapOverlay
