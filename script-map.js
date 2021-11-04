var startingLng=0.00;
var startingLat=0.00;
var destinationLng=0.00;
var destinationLat=0.00;
var xLng=0.00;
var xLat=0.00;
var activePointId="";
var points = new Map();

//create map
mapboxgl.accessToken = 'pk.eyJ1IjoidmlubmlqIiwiYSI6ImNraHRiOGR3aTRpbmMyemw2dnVheWxiYmwifQ.RA_Ldq20ag_o9lo8G5jGOA';
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/dark-v10', // style URL
  center: [24.2, 57.0], // starting position [lng, lat]
  zoom: 10 // starting zoom
});

//---------------------------------------------------GEOCODER
//create geocoder
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  marker:{
    color: '#61D384'
    //element : '<img src = "circle.png" width="7px" height="7px" id="circle">'
  },
  bbox: [20.819091796874996,
        55.67138928829547,
        28.311767578125,
        58.112714441253125],
  clearOnBlur : true
});
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
//geocoder functionality
geocoder.on('result', function(e) {
  xLng=e.result.center[0];
  xLat=e.result.center[1];
  console.log(xLng);
  console.log(xLat);
  destinationLat=xLat;
  destinationLng=xLng;
})

//--------------------------------------------------SAVED POINTS
if(localStorage.savedPoints != undefined){
  points = new Map(JSON.parse(localStorage.savedPoints));
  console.log(points);
  console.log(points.size);
}

//---------------------------------------------------USER LOCATION
getLocation();
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(updateLocation)
  } else {
    alert("Please allow geolocation or move to a browser that supports it!");
  }
}
function updateLocation(position){
  console.log("Position Updated! *pls dont move too fast*");
  startingLat=position.coords.latitude;
  startingLng=position.coords.longitude;
  setStartingPoint();
}

//---------------------------------------------------ROUTING
function go(){
  geocoder.clear();
  if(xLng == 0.00)alert("Please enter an adress");
  else{
    getAddress(xLng, xLat);
    getRoute();
  }
}
async function getAddress(aLng, aLat){
  //url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/${destinationLng},${destinationLat}.json?access_token=${mapboxgl.accessToken}'
  const query = await fetch(
    'https://api.mapbox.com/geocoding/v5/mapbox.places/'+aLng+','+aLat+'.json?access_token=pk.eyJ1IjoidmlubmlqIiwiYSI6ImNraHRiOGR3aTRpbmMyemw2dnVheWxiYmwifQ.RA_Ldq20ag_o9lo8G5jGOA',
    { method: 'GET' }
  );
  const json = await query.json();
  const data = json.features[0];
  const name = data.text;
  console.log(name);
  addPoint(aLng, aLat, name);
  points.set(name, {aLng, aLat});
  localStorage.savedPoints = JSON.stringify(Array.from(points));
  console.log(points.size);
  console.log(JSON.parse(localStorage.savedPoints));
}
async function getRoute(){
  console.log("routing to ... (ur probably better off picking the route urself)");
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
  map.setLayoutProperty('route', 'visibility', 'visible');
  map.fitBounds([
    [Math.min(startingLng, destinationLng)-0.01, Math.min(startingLat, destinationLat)-0.01],
    [Math.max(startingLng, destinationLng)+0.04, Math.max(startingLat, destinationLat)+0.04]
  ]);
  console.log("la route has appeared");
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
        'line-opacity': 0.5
      }
    });
  }
}

//---------------------------------------------------POINT DATA
//add a point to the map
function createGeojsonPoint(xLng, xLat, id){
  //var id = xLng+xLat+"";
  var geojson = {
    "type": "FeatureCollection",
    "features":
    [{
      "type": "Feature",
      "properties": {
        "name": "PUNKTS",
        "id" : id
      },
      "geometry":
      {
      "type": "Point",
      "coordinates": [ xLng, xLat ]
      }
    }]
  }
  return geojson;
}
var popups = [];
function addPoint(xLng, xLat, id){
  var geojson = createGeojsonPoint(xLng, xLat, id);
  if (map.getSource(id)) {
    map.getSource(id).setData(geojson);
  }
  else{
    map.addSource(id,{
      type: 'geojson',
      data: geojson
    });
  }
  if(! map.getLayer(id)){
    map.addLayer({
        'id': id,
        'type': 'circle',
        'source': id,
        'paint': {
          'circle-color': '#61D384',
          'circle-radius' : 7
        },
    });
  }
  map.on('click', id, (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = e.features[0].properties.name;
    activePointId = e.features[0].properties.id;
    destinationLat=e.lngLat.lat;
    destinationLng=e.lngLat.lng;
    getRoute();
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    var popup =  new mapboxgl.Popup()
    .setLngLat(coordinates)
    .setHTML('<img id="trash" src="uwu_trash.png" width="50px" height="50px" onclick="removePoint()"/>')
    .addTo(map);
    popups.push(popup);
  });
  console.log("THE POINT HAS BEEN ADDED!!!");
}
// remove the point from the map
function removePoint(e){
  console.log("TRASH INITIATED *batman voice*");
  if (map.getLayer(activePointId)) map.removeLayer(activePointId);
  if(map.getSource(activePointId)) map.removeSource(activePointId);
  points.delete("placename"+activePointId);
  map.setLayoutProperty('route', 'visibility', 'none');
  console.log("la route has disappeared");
  popups.forEach(popup => popup.remove());
}

//---------------------------------------------------DISPLAY DATA
function setStartingPoint(){
  map.getSource('startPoint').setData({
    "type": "FeatureCollection",
    "features": [
    {
    "type": "Feature",
    "properties": {"name": "Your Location"
    },
    "geometry":
    {
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
        'circle-color': '#61D384',
        'circle-radius' : 7
      },
  });
  map.addSource('velo-RIGA', {
    type: 'vector',
    url: 'mapbox://vinnij.d9fanad2'
  });
  map.addLayer({
      'id': 'velo-RIGA',
      'type': 'line',
      'source': 'velo-RIGA',
      'source-layer': 'veloRIGA-filtered-demicf',
      'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': {
      'line-color': '#D2C2F8',
      'line-width': 3
    }
  });
  map.addSource('velo-MARUPE', {
    type: 'vector',
    url: 'mapbox://vinnij.0l7pjl01'
  });
  map.addLayer({
      'id': 'velo-MARUPE',
      'type': 'line',
      'source': 'velo-MARUPE',
      'source-layer': 'veloMARUPE-filtered-3myozo',
      'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': {
      'line-color': '#D2C2F8',
      'line-width': 3
    }
  });
  map.addSource('velo-SAVIENOJUMI', {
    type: 'vector',
    url: 'mapbox://vinnij.4i52c29c'
  });
  map.addLayer({
      'id': 'velo-SAVIENOJUMI',
      'type': 'line',
      'source': 'velo-SAVIENOJUMI',
      'source-layer': 'velo-PAPILDUS-9r14vo',
      'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': {
      'line-color': '#A79BEC',
      'line-width': 3
    }
  });
  for (const [key, value] of points.entries()) {
    addPoint(value.xLng, value.xLat, ""+value.xLng+value.xLat);
  }
});
map.on('click', 'velo-RIGA', (e) => {
  const coordinates = e.features[0].geometry.coordinates[0];
  const landlord = e.features[0].properties.Apsaimniek;
  const length = e.features[0].properties.LENGTH;
  const name = e.features[0].properties.nosaukums_;
  const year = e.features[0].properties.Real_txt;
  const type = e.features[0].properties.Veloinfra;
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }
  new mapboxgl.Popup()
    .setLngLat(coordinates)
    .setHTML('<div>' + landlord + '<br>' + length + '<br>' + name + '<br>' + year + '<br>' + type+ '</div>')
    .addTo(map);
});
