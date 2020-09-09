<template>
  <div class="basemap">
    <div id="mapContainer" class="basemap"></div>
    <div id="clearButton" @click="removeMarkers">❌Clear</div>
    <div v-if="duration" id="duration">
      🚗 Time Required : {{ duration }} Minute
    </div>
    <div v-if="markers.length" class="modes">
      <v-radio-group v-model="mode" column light>
        <v-radio :label="`Walking 🚶‍♂️`" value="walking"></v-radio>
        <v-radio :label="`Driving 🚗`" value="driving"></v-radio>
      </v-radio-group>
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
      mode: 'driving',
    }
  },
  watch: {
    async mode() {
      await this.getRoute()
      console.log(this.mode)
    },
  },
  mounted() {
    const self = this
    mapboxgl.accessToken = this.accessToken
    navigator.geolocation.getCurrentPosition((position) => {
      // this.markers[]
      const { latitude, longitude } = position.coords
      this.myLocation = { latitude, longitude }
    })
    console.log(this.myLocation)
    this.map = new mapboxgl.Map({
      container: 'mapContainer',
      style: 'mapbox://styles/mapbox/streets-v8',
      center: [11, 11],
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

    this.map.on('click', function (e) {
      const { lat, lng } = e.lngLat.wrap()
      const marker = new mapboxgl.Marker({
        draggable: true,
      })
        .setLngLat([lng, lat])
        .addTo(self.map)
      marker.on('dragend', () => {
        self.getRoute()
      })
      self.markers = self.markers.length ? [...self.markers, marker] : [marker]
      self.getRoute()
    })

    self.map.addControl(new mapboxgl.FullscreenControl())
  },
  methods: {
    modeChange(e) {
      console.log('changed', e.target, this.mode)
    },
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
        this.accessToken,
        this.mode
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
  bottom: 32px;
  text-align: center;
  right: 45px;
  font-weight: bold;
  font-size: 0.8em;
  padding: 5px 9px;
  color: black;
  background-color: rgba(255, 255, 255, 0.9);
  font-family: sans-serif;
  border-radius: 10%;
  cursor: pointer;
  border: 2px solid rgba(128, 128, 128, 0.407);
}
#duration {
  position: absolute;
  top: 10px;
  text-align: center;
  left: 10px;
  font-weight: bold;
  font-size: 0.8em;
  padding: 10px 10px;
  color: black;
  background-color: rgba(255, 255, 255, 0.9);
  font-family: sans-serif;
  border-radius: 20px;
  border: 2px solid rgba(128, 128, 128, 0.407);
}
.modes {
  position: absolute;
  top: 65px;
  left: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  color: rgb(116, 116, 197);
  padding: 10px;
  border-radius: 20px;
}
</style>
