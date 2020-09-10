<template>
  <div class="basemap" light>
    <div id="mapContainer" class="basemap"></div>
    <div class="layers">
      <draggable
        :list="myArray"
        class="list-group"
        ghost-class="ghost"
        :move="checkMove"
        @start="dragging = true"
        @end="dragging = false"
      >
        <div v-for="element in myArray" :key="element.label">
          <v-checkbox
            v-model="element.state"
            :label="`${element.label}`"
            light
            :value="element.value"
            @change="updateLayers(element.value)"
          ></v-checkbox>
        </div>
      </draggable>
    </div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl'
// eslint-disable-next-line no-unused-vars
import draggable from 'vuedraggable'
import roadsLayer from '../assets/ne_10m_roads.json'
// eslint-disable-next-line no-unused-vars
import populatedPlaces from '../assets/ne_10m_populated_places.json'
export default {
  name: 'BaseMap',

  components: {
    draggable,
  },
  data() {
    return {
      accessToken:
        'pk.eyJ1IjoieW9naTMzIiwiYSI6ImNrZXRkejhrajBkdnYzNGxoZXc4NGc5bjQifQ.19___kQj8FppDw5_I3uOGg',
      map: {},
      layers: {
        roads: true,
        population: false,
      },
      myArray: [
        { label: 'Roads', value: 'roads', state: false },
        { label: 'Population', value: 'population', state: false },
      ],
    }
  },

  mounted() {
    mapboxgl.accessToken = this.accessToken
    // const self = this
    this.map = new mapboxgl.Map({
      container: 'mapContainer',
      style: 'mapbox://styles/mapbox/streets-v8',
      // style: 'mapbox://styles/yogi33/ckev530yj09ox19nt5mx33r6t',
      center: [11, 11],
      zoom: 3,
    })

    // this.map.on('load', function () {
    //   self.addRoadsLayer()
    // })

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    })
    this.map.addControl(geolocate, 'bottom-right')
  },
  methods: {
    updateLayers(event) {
      console.log(this.myArray)
      for (const layer of this.myArray) {
        console.log(layer)
        if (layer.state) {
          switch (layer.value) {
            case 'roads':
              console.log('adding road')
              this.addRoadsLayer()
              break
            case 'population':
              this.addPopulationLayer()
              break
            default:
              break
          }
        } else {
          switch (layer.value) {
            case 'roads':
              this.removeRaodLayer()
              break
            case 'population':
              this.removePopulation()
              break
          }
        }
      }
    },
    addRoadsLayer() {
      const self = this
      if (!this.map.getSource('roads')) {
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
            'line-width': 2,
          },
        })
      }
    },
    addPopulationLayer() {
      const self = this
      if (!this.map.getSource('points')) {
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
      }

      console.log('pop data loaded 🤴')
    },
    removeRaodLayer() {
      if (this.map.getSource('roads')) {
        this.map.removeLayer('route')
        this.map.removeSource('roads')
      }
      console.log(this.map.getSource('roads'))
    },
    removePopulation() {
      if (this.map.getSource('points')) {
        this.map.removeLayer('population')
        this.map.removeSource('points')
      }
      console.log(this.map.getSource('points'))
    },
    checkMove(e) {
      window.console.log('Future index: ' + e)
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
.layers {
  position: absolute;
  top: 65px;
  left: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  color: rgb(116, 116, 197);
  padding: 0 10px;
  border-radius: 10px;
}
</style>
