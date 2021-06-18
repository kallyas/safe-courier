import { Component } from 'react'
import GoogleMap from 'google-map-react'

import Marker from './Marker'
import Polyline from './Polyline'

class Map extends Component {
  constructor (props) {
    super(props)

    this.state = {
      mapsLoaded: false,
      map: null,
      maps: null
    }
  }

  onMapLoaded (map, maps) {
    this.fitBounds(map, maps)

    this.setState({
      ...this.state,
      mapsLoaded: true,
      map: map,
      maps: maps
    })
  }

  fitBounds (map, maps) {
    var bounds = new maps.LatLngBounds()
    for (let marker of this.props.markers) {
      bounds.extend(
        new maps.LatLng(marker.lat, marker.lng)
      )
    }
    map.fitBounds(bounds)
  }

  afterMapLoadChanges () {
    return (
      <div style={{display: 'none'}}>
        <Polyline
          map={this.state.map}
          maps={this.state.maps}
          markers={this.props.markers} />
      </div>
    )
  }

  render () {
    return (
      <GoogleMap
        bootstrapURLKeys={{key: 'AIzaSyB8_KgR5bH7kszSTTlv8lVOAs-17-K8J4c'}}
        style={{height: '100vh', width: '100%'}}
        defaultCenter={this.props.center}
        defaultZoom={this.props.zoom}
        onGoogleApiLoaded={({map, maps}) => this.onMapLoaded(map, maps)}>
        <Marker text={'SENDER'} lat={0.4771495227984964} lng={32.75372993913434} />
        <Marker text={'RECIEVER'} lat={0.486676448594891} lng={32.777033228729884} />
        {this.state.mapsLoaded ? this.afterMapLoadChanges() : ''}
      </GoogleMap>
    )
  }
}

Map.defaultProps = {
  markers: [
    {lat:0.4771495227984964, lng: 32.75372993913434},
    {lat: 0.486676448594891, lng: 32.777033228729884}
  ],
  center: [47.367347, 8.5500025],
  zoom: 4
}

export default Map