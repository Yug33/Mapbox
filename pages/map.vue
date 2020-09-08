<template>
  <div id="mapContainer" class="basemap"></div>
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
      } else {
        // otherwise, make a new request
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
      // add turn instru
    },
    onDragEnd() {
      this.getRoute()
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
</style>
