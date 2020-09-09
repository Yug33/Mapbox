<template>
  <div class="basemap" light>
    <div id="mapContainer" class="basemap"></div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl'
// eslint-disable-next-line no-unused-vars
import roadsLayer from '../assets/ne_10m_roads.json'
// eslint-disable-next-line no-unused-vars
import populatedPlaces from '../assets/ne_10m_populated_places.json'
export default {
  name: 'BaseMap',
  data() {
    return {
      accessToken:
        'pk.eyJ1IjoieW9naTMzIiwiYSI6ImNrZXRkejhrajBkdnYzNGxoZXc4NGc5bjQifQ.19___kQj8FppDw5_I3uOGg',
      map: {},
    }
  },

  mounted() {
    mapboxgl.accessToken = this.accessToken
    const self = this
    this.map = new mapboxgl.Map({
      container: 'mapContainer',
      style: 'mapbox://styles/mapbox/streets-v8',
      // style: 'mapbox://styles/yogi33/ckev530yj09ox19nt5mx33r6t',
      center: [11, 11],
      zoom: 9,
    })

    this.map.on('load', function () {
      self.addRoadsLayer()
      self.addPopulationLayer()
    })

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    })
    this.map.addControl(geolocate, 'bottom-right')
  },
  methods: {
    addRoadsLayer() {
      const self = this
      self.map.addSource('roads', {
        type: 'geojson',
        data: roadsLayer,
      })
      self.map.addLayer({
        id: 'route',
        type: 'line',
        source: 'roads',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#888',
          'line-width': {
            type: 'exponential',
            property: 'line_width',
            base: 2,
            stops: [
              [12, 2],
              [22, 180],
            ],
          },
        },
      })
    },
    addPopulationLayer() {
      const self = this
      self.map.addSource('points', {
        type: 'geojson',
        data: populatedPlaces,
      })

      self.map.addLayer({
        id: 'population',
        type: 'circle',
        source: 'points',
        paint: {
          // make circles larger as the user zooms from z12 to z22
          'circle-radius': {
            property: 'POP_MAX',
            stops: [
              [0, 0],
              [10000, 1],
              [100000, 3.16],
              [1000000, 10],
              [10000000, 31.6],
            ],
          },
          // color circles by ethnicity, using a match expression
          // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
          'circle-color': '#223b53',
          'circle-stroke-color': 'white',
          'circle-stroke-width': 1,
          'circle-opacity': 0.5,
        },
      })

      console.log('pop data loaded 🤴')
    },
  },
}
</script>
<style>
@import 'https://api.mapbox.com/mapbox-gl-js/v1.10.1/mapbox-gl.css';
.basemap {
  width: 100%;
  height: 100%;
}
</style>
