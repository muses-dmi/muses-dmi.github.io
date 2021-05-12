var regions;

// array of gen fences that will be added to map
var geoFences = new Array();

let dropArea = document.getElementById('drop-area')

;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
})
    
function preventDefaults (e) {
    e.preventDefault()
    e.stopPropagation()
}

;['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false)
})
    
;['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false)
})
      
function highlight(e) {
    dropArea.classList.add('highlight')
}
      
function unhighlight(e) {
    dropArea.classList.remove('highlight')
}

dropArea.addEventListener('drop', handleDrop, false)

function handleDrop(e) {
    let dt = e.dataTransfer
    let files = dt.files

    handleFiles(files)
}
      
function handleFiles(files) {
    ([...files]).forEach(uploadFile)
}

function uploadFile(file) {  
    let re = /(?:\.([^.]+))?$/
    let ext = re.exec(file.name)
    
    if (ext.length > 1) {
        if (ext[1] === "gpx" ) {
            // load an unedited walk recorded as GPX
            var reader = new FileReader();
            reader.onload = function(event) {
                //console.log(event.target.result);            
                regions = convertToGeoJSON(event.target.result, "Region ", fence_radius) 
                setGeofences(regions)
                //console.log(JSON.stringify(regions))
            }
            reader.readAsText(file)
        }
        else if (ext[1] === "geoJSON" ) {
            // load a Muses GeoJSON file to edit
            var reader = new FileReader();
            reader.onload = function(event) {
                //console.log(event.target.result);            
                //regions = convertToGeoJSON(event.target.result, "Region ", fence_radius) 
                regions = JSON.parse(event.target.result).features
                setGeofences(regions)
                console.log(JSON.stringify(regions))
            }
            reader.readAsText(file)
        }
    }
}
    
function saveMusesJSON() {
    let i = 0
    drawnItems.eachLayer(function (circle) {
        console.log(circle.getBounds().getCenter().toString()) 
        console.log(circle.getRadius())   
        regions[i].properties.radius = circle.getRadius()
        i++
    });

    geo = { 
        type: "FeatureCollection",
        features: regions
    }

    geoJSON = JSON.stringify(geo, null, 2)
    //console.log(regionsStr)

    var blob = new Blob([geoJSON], {type: "text/plain;charset=utf-8"});
    window.saveAs(blob, "muses.geoJSON")
}

var template = '<form id="popup-form">\
    <label for="input-name"><b>Name:</b></label>\
    <input id="input-name" class="popup-input" type="text" />\
    <button class="button" id="button-submit" type="button">Save Changes</button>\
</form>';

function setGeofences(regions) {
    //console.log(JSON.stringify(regions))
    let lat = regions[0].geometry.coordinates[1]
    let lon = regions[0].geometry.coordinates[0]
    map.setView([lat, lon], 16);
    let circle = L.circle([lat, lon], {
        color: '#5ec948',
        fillColor: '#5ec948',
        fillOpacity: 0.5,
        radius: regions[0].properties.radius,
        riseOnHover: true
    });

    var popupOptions = {maxWidth: 500};
    var popupContent = template;
    //'<h3>' + regions[0].properties.name + '</h3>';

    circle.bindPopup(popupContent, popupOptions);
    circle.on('click', function (e) {
        var inputName = L.DomUtil.get('input-name');
        inputName.value = regions[0].properties.name;
        L.DomEvent.addListener(inputName, 'change', function (e) {
            regions[0].properties.name = e.target.value;
        });

        circle.openPopup(circle.getCenter())
        //alert("name " + popupContent);
    });

    drawnItems.addLayer(circle)


    for (let i = 1; i < regions.length; i++) {
        let lat = regions[i].geometry.coordinates[1]
        let lon = regions[i].geometry.coordinates[0]

        let circle = L.circle([lat, lon], {
            color: '#F3B839',
            fillColor: '#F3B839',
            fillOpacity: 0.5,
            radius: regions[i].properties.radius
        });

        circle.bindPopup(popupContent, popupOptions);
        circle.on('click', function (e) {
            var inputName = L.DomUtil.get('input-name');
            inputName.value = regions[i].properties.name;
            L.DomEvent.addListener(inputName, 'change', function (e) {
                regions[i].properties.name = e.target.value;
            });

            circle.openPopup(circle.getCenter())
            //alert("name " + popupContent);
        });

        drawnItems.addLayer(circle)
    }
}

function convertToGeoJSON(input, prefix, radius) {
    parser = new DOMParser();
        xmlDoc = parser.parseFromString(input,"text/xml")
        let convertedWithStyles = toGeoJSON.gpx(xmlDoc, { styles: true })

        // remove path, we are only interesed in waypoints for this process
        let regions = convertedWithStyles.features.slice(1) 

        // process waypoints
        for (let i = 0; i < regions.length; i++) {
            // rename each waypoint
            regions[i].properties.name = prefix + i.toString()

            // add a default radius to turn waypoint into geofence for region
            regions[i].properties.radius = radius
        }

        return regions
}

// initialize the map
//var map = L.map('map').setView([51.47, -2.53], 13);
var fence_radius = 20;

var map = L.map('map').setView(
    [51.4722326416855, -2.5334985098113356], 
    10);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiY3ViZXJvbyIsImEiOiJja29mbTNqYWcwZ2swMm5wMmtpdHU3a2Y4In0.R7oAkDHPeb9jvMwb0k1wTw'
}).addTo(map);

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
    draw: {
        polyline: false,
        polygon: false,
        circle: true,
        marker: false
    },
    edit: {
        featureGroup: drawnItems,
        remove: true
    }
});
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, function (e) {
    var type = e.layerType,
    layer = e.layer;

    if (type === 'circle') {
        layer.bindPopup('A popup!');
    }

    drawnItems.addLayer(layer);
});


function onMapClick(e) {
    console.log("You clicked the map at " + e.latlng);
}

map.on('click', onMapClick);