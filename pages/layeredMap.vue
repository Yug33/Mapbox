<template>
  <div class="basemap">
    <div id="mapContainer" class="basemap"></div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl'
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
