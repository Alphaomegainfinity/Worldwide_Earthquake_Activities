// Store our API endpoint as queryUrl.
let queryUrl =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function magColors(mag) {
  return mag >= 7
    ? "maroon"
    : mag >= 5.5
    ? "red"
    : mag >= 4
    ? "orange"
    : mag >= 2.5
    ? "yellow"
    : mag >= 1
    ? "green"
    : "#E2FFAE";
}

function circle_marker(feature, latlng) {
  let options = {
    radius: feature.properties.mag * 5,
    fillColor: magColors(feature.properties.mag),
    color: magColors(feature.properties.mag),
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.35,
  };
  return L.circleMarker(latlng, options);
}

function onEachFeature(feature, layer) {
  if (feature.properties.mag < 1) {
    return layer.setRadius(5);
  } else if (feature.properties.mag < 2.5) {
    return layer.setRadius(10);
  } else if (feature.properties.mag < 4) {
    return layer.setRadius(15);
  } else if (feature.properties.mag < 5.5) {
    return layer.setRadius(20);
  } else if (feature.properties.mag < 7) {
    return layer.setRadius(25);
  } else layer.setRadius(100);
}

function createFeatures(earthquakeData) {
  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(
      feature.properties.time
    )}</p>
      <hr><h2> ${feature.properties.mag} </h2>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: circle_marker,
  });
  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Create the base layers.
  let street = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
  );

  let topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  });

  // Create a baseMaps object.
  let baseMaps = {
    "World Map": street,
    "Topographic Map": topo,
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes,
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquakes],
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false,
    })
    .addTo(myMap);

  // Adding legend for Magnitude level
  let legend = L.control({ position: "bottomright" });
  legend.onAdd = function (map) {
    let div = L.DomUtil.create("div", "info legend");
    labels = ["<strong>Magnitude Level</strong>"],
      categories = [1, 2.5, 4, 5.5, 7, 7.01];

    for (let i = 0; i < categories.length; i++) {
      div.innerHTML += labels.push(
        '<i class="square" style="background:' +
          magColors(categories[i] + 1) +
          '"></i>' +
          categories[i] +
          (categories[i + 1] ? "&ndash;" + categories[i + 1] : "+")
      );
    }
    div.innerHTML = labels.join("<br>");

    return div;
  };
  legend.addTo(myMap);
}
