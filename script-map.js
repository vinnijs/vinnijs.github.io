mapboxgl.accessToken = 'pk.eyJ1IjoidmlubmlqIiwiYSI6ImNraHRiOGR3aTRpbmMyemw2dnVheWxiYmwifQ.RA_Ldq20ag_o9lo8G5jGOA';
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/dark-v10', // style URL
  center: [24.2, 57.0], // starting position [lng, lat]
  zoom: 10 // starting zoom
});

map.addControl(
  new mapboxgl.NavigationControl());

map.on('load', () => {
  map.addSource('velo-8zsm7r', {
    type: 'vector',
    url: 'mapbox://vinnij.b5xipqys'
  });
  map.addLayer({
    'id': 'velo',
    'type': 'line',
    'source': 'velo-8zsm7r',
    'source-layer': 'velo-8zsm7r',
    'layout': {
    'line-join': 'round',
    'line-cap': 'round'
    },
    'paint': {
    'line-color': '#ff69b4',
    'line-width': 1
    }
  });
});
