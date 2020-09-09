const axios = require('axios')
const api = {
  methods: {
    getRoute(lagLatString, accessToken, mode = 'driving') {
      return new Promise((resolve, reject) => {
        const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/
          ${lagLatString}
          ?alternatives=true&geometries=geojson&steps=true&access_token=${accessToken}`

        axios
          .get(url)
          .then((res) => {
            console.log(res)
            resolve(res)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
  },
}
export { api }
