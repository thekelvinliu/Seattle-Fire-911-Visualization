var map;
var markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 47.6044446, lng: -122.3491773},
    zoom: 12
  });
}

function drop() {
    clearMarkers();
    for (var i = 0; i < data.length; i++) {
        addMarkerWithTimeout(data[i], i*200);
    }
}

function addMarkerWithTimeout(obj, timeout) {
    window.setTimeout(function() {
        var time = obj.datetime.slice(11, 16);
        var day = obj.datetime.slice(0, 10);
        var desc = '<div>' +
            '<h3>' +
            obj.address +
            '</h3>' +
            '<p>' +
            obj.type + ' at ' + time + ' on ' + day +
            '</p>' +
            '</div>'
        var info = new google.maps.InfoWindow({
            content: desc,
            maxWidth: 350
        });
        var m = new google.maps.Marker({
            title: obj.incident_number,
            position: {lat: parseFloat(obj.latitude), lng: parseFloat(obj.longitude)},
            map: map,
            animation: google.maps.Animation.DROP
        });
        markers.push(m);
        m.addListener('click', function() {
            info.open(map, m);
        });
    }, timeout);
}

function clearMarkers() {
    while (markers.length > 0) {
        markers.pop().setMap(null);
    }
}

drop();
