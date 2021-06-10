import React, { Component } from 'react'
import { Map, GoogleApiWrapper } from 'google-maps-react';

const mapStyle = {
    width: '100%',
    height: '100%'
}

export class MapContainer extends Component {
    render() {
        return (
            <Map 
            google={this.props.google}
            zoom={14}
            style={mapStyle}
            initialCenter={{
                lat: -1.2884,
                lng: 36.8233
            }}
            />
        )
    }
}

export default GoogleApiWrapper({
    apiKey: 'YOUR_GOOGLE_MAPS_API_KEY_GOES_HERE'
  })(MapContainer);
