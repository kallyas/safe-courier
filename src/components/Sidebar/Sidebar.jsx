import React from 'react'
import { MapContainer } from '../MapContainer/MapContainer'
import MapOverlay from '../MapOverlay/MapOverlay'
import './sidebar.css'

function Sidebar() {
    return (
        <div className="side-bar">
          <MapContainer />  
          <MapOverlay />
        </div>
    )
}

export default Sidebar
