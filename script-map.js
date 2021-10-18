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
    'id': 'velo-8zsm7r',
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
map.on('click', 'velo-8zsm7r', (e) => {
  // Copy coordinates array.
  const coordinates = e.features[0].geometry.coordinates[0];
  const landlord = e.features[0].properties.Apsaimniek;
  const length = e.features[0].properties.LENGTH;
  const name = e.features[0].properties.nosaukums_;
  const year = e.features[0].properties.Real_txt;
  const type = e.features[0].properties.Veloinfra;

  // Ensure that if the map is zoomed out such that multiple
  // copies of the feature are visible, the popup appears
  // over the copy being pointed to.
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }
  console.log(coordinates);
  console.log(landlord);
  console.log(length);
  console.log(name);
  console.log(year);
  console.log(type);
  new mapboxgl.Popup()
    .setLngLat(coordinates)
    .setHTML('<div>' + landlord + '<br>' + length + '<br>' + name + '<br>' + year + '<br>' + type+ '</div>')
    //.setHTML(<div> + 'landlord' + <br> + 'length' + <br> + 'name' + <br> + 'year' + <br> + 'type'+ </div>)
    .addTo(map);
});
