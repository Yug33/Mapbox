<template>
  <div class="basemap">
    <div id="mapContainer" class="basemap"></div>
    <div id="clearButton" @click="removeMarkers">Clear</div>
    <div v-if="duration" id="duration">
      🚗 Time Required :- {{ duration }} Minute
    </div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl'
import { api } from '../api'
// import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
export default {
  name: 'BaseMap',
  data() {
    return {
      accessToken:
        'pk.eyJ1IjoieW9naTMzIiwiYSI6ImNrZXRkejhrajBkdnYzNGxoZXc4NGc5bjQifQ.19___kQj8FppDw5_I3uOGg',
      map: {},
      markers: [],
      myLocation: {},
      duration: 0,
    }
  },
  mounted() {
    mapboxgl.accessToken = this.accessToken
    navigator.geolocation.getCurrentPosition((position) => {
      // this.markers[]
      const { latitude, longitude } = position.coords
      this.myLocation = { latitude, longitude }
    })
    this.map = new mapboxgl.Map({
      container: 'mapContainer',
      style: 'mapbox://styles/mapbox/streets-v8',
      center: [30.5, 50.5],
      zoom: 9,
    })

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    })
    this.map.addControl(geolocate, 'bottom-right')
    // const geocoder = new MapboxGeocoder({
    //   accessToken: mapboxgl.accessToken,
    //   mapboxgl,
    // })
    // this.map.addControl(geocoder, 'top-left')

    const self = this
    this.map.on('click', function (e) {
      const { lat, lng } = e.lngLat.wrap()
      const marker = new mapboxgl.Marker({
        draggable: true,
      })
        .setLngLat([lng, lat])
        .addTo(self.map)
      marker.on('dragend', () => {
        console.log('Dragged')
        self.getRoute()
      })
      self.markers = self.markers.length ? [...self.markers, marker] : [marker]
      self.getRoute()
    })

    self.map.addControl(new mapboxgl.FullscreenControl())
  },
  methods: {
    async getRoute() {
      console.log('Getting Route 🤷‍♂️')
      const markerCoordinates = this.markers.reduce(
        (lngLatString, marker, index) => {
          const { lng, lat } = marker._lngLat
          if (!index) {
            const { longitude, latitude } = this.myLocation
            return `${longitude}%2C${latitude}%3B${lng}%2C${lat}`
          }
          return lngLatString + `%3B${lng}%2C${lat}`
        },
        ''
      )

      const response = await api.methods.getRoute(
        markerCoordinates,
        this.accessToken
      )

      this.getDirections(response.data)
    },
    getDirections(routeAPIData) {
      this.duration = routeAPIData.routes[0].duration
      const route = routeAPIData.routes[0].geometry.coordinates
      const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route,
        },
      }
      if (this.map.getSource('route')) {
        this.map.getSource('route').setData(geojson)
        // console.log(this.map.getSource('route'), 'second time')
      } else {
        // otherwise, make a new request
        // console.log('first time')
        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: geojson,
              },
            },
          },
        })
      }
      this.map.getSource('route').setData(geojson)
    },
    onDragEnd() {
      this.getRoute()
    },
    removeMarkers() {
      if (this.markers !== null && this.map.getSource('route')) {
        for (let i = this.markers.length - 1; i >= 0; i--) {
          this.markers[i].remove()
        }
        this.markers.length = 0
        this.duration = 0
        this.map.removeLayer('route')
        this.map.removeSource('route')
      }
      console.log(this, 'removed😢')
    },
  },
}
</script>
<style>
@import 'https://api.mapbox.com/mapbox-gl-js/v1.10.1/mapbox-gl.css';
@import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
.basemap {
  width: 100%;
  height: 100%;
}
#clearButton {
  position: absolute;
  margin: 28px;
  width: 50px;
  bottom: 0;
  text-align: center;
  right: 20px;
  font-weight: bold;
  font-size: 0.8em;
  padding: 7px 0px;
  color: black;
  background-color: rgba(255, 255, 255, 0.9);
  font-family: sans-serif;
  border-radius: 10%;
  cursor: pointer;
}
#duration {
  position: absolute;
  margin: 28px;

  top: 0;
  text-align: center;
  left: 20px;
  font-weight: bold;
  font-size: 0.8em;
  padding: 10px 10px;
  color: black;
  background-color: rgba(255, 255, 255, 0.9);
  font-family: sans-serif;
  border-radius: 20px;
  border: 2 solid rgb(40, 211, 253);
}
#clearbutton:hover {
  background-color: rgba(212, 68, 68, 0.9);
  color: white;
}
</style>
