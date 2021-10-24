var startingLng=0.00;
var startingLat=0.00;
var destinationLng=0.00;
var destinationLat=0.00;

//create map
mapboxgl.accessToken = 'pk.eyJ1IjoidmlubmlqIiwiYSI6ImNraHRiOGR3aTRpbmMyemw2dnVheWxiYmwifQ.RA_Ldq20ag_o9lo8G5jGOA';
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/dark-v10', // style URL
  center: [24.2, 57.0], // starting position [lng, lat]
  zoom: 10 // starting zoom
});

//create geocoder
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl
});
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

//user-location
getLocation();
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(updateLocation)
  } else {
    alert("Please allow geolocation or move to a browser that supports it!");
  }
}
function updateLocation(position){
  console.log("Position Updated!");
  startingLat=position.coords.latitude;
  startingLng=position.coords.longitude;
  setStartingPoint();
}

//geocoder functionality
geocoder.on('result', function(e) {
  xLng=e.result.center[0];
  xLat=e.result.center[1];
  console.log(xLng);
  console.log(xLat);
  destinationLat=xLat;
  destinationLng=xLng;
})

//routing
function go(){
  getRoute();
}
async function getRoute(){
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/cycling/${startingLng},${startingLat};${destinationLng},${destinationLat}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
    { method: 'GET' }
  );
  const json = await query.json();
  const data = json.routes[0];
  const route = data.geometry.coordinates;
  const geojson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: route
    }
  }
  if (map.getSource('route')) {
    map.getSource('route').setData(geojson);
  }
  else {
    map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: geojson
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#fcba03',
        'line-width': 5,
        'line-opacity': 0.75
      }
    });
  }
}

//display data
function setStartingPoint(){
  map.getSource('startPoint').setData({
    "type": "FeatureCollection",
    "features": [{
    "type": "Feature",
    "properties": {"name": "Your Location"},
    "geometry": {
    "type": "Point",
    "coordinates": [ startingLng, startingLat ]
    }
    }]
  });
}
map.on('load', () => {
  map.addSource('startPoint', {
    type: 'geojson',
    data: {
    "type": "FeatureCollection",
    "features": [{
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Point",
        "coordinates": [ 24.10694,56.9475]
        }
      }]
    }
  });
  map.addLayer({
      'id': 'startPoint',
      'type': 'circle',
      'source': 'startPoint',
      'paint': {
        'circle-color': '#61D384'
      },
  });
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
      'line-color': '#D2C2F8',
      'line-width': 3
    }
  });

});
map.on('click', 'velo-8zsm7r', (e) => {
  const coordinates = e.features[0].geometry.coordinates[0];
  const landlord = e.features[0].properties.Apsaimniek;
  const length = e.features[0].properties.LENGTH;
  const name = e.features[0].properties.nosaukums_;
  const year = e.features[0].properties.Real_txt;
  const type = e.features[0].properties.Veloinfra;
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }
  // console.log(coordinates);
  // console.log(landlord);
  // console.log(length);
  // console.log(name);
  // console.log(year);
  // console.log(type);
  new mapboxgl.Popup()
    .setLngLat(coordinates)
    .setHTML('<div>' + landlord + '<br>' + length + '<br>' + name + '<br>' + year + '<br>' + type+ '</div>')
    .addTo(map);
});
