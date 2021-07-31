/* eslint-disable import/no-webpack-loader-syntax */

//import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useRef, useEffect } from 'react'
import { Card } from "@themesberg/react-bootstrap"

import mapboxgl from '!mapbox-gl'
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css'

const MiniMap = () => {
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
    const containerRef = useRef(null)

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: containerRef.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [32.58662, 0.32400],
            zoom: 12.5,
        })

        const directions = new MapboxDirections({
            accessToken: mapboxgl.accessToken,
            profile: 'mapbox.driving',
            unit: 'metric'
        })
        
        map.addControl(directions, 'top-left');
        map.addControl(new mapboxgl.NavigationControl(), "bottom-right")
        return () => map.remove()
    }, [])

    return (
        <Card border="light" className="shadow-sm">
            <Card.Header>
            <div className="d-block">
                <h6 className="fw-normal text-gray mb-2">Shipping</h6>
            </div>
            </Card.Header>
            <Card.Body className="d-flex flex-row align-items-center flex-0 border-bottom"
            style={{ height: "200px" }}
            >
                <div
                    style={{
                        bottom: 0,
                        left: 0,
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        ZIndex: -1,
                    }}
                     ref={containerRef}></div>
            </Card.Body>
        </Card>
    )
}

export default MiniMap;
