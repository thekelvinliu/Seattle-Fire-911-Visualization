var map;
var markers = [];
var openWindow = null;
var selectedDiv = null;

//initialize map
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 47.6044446, lng: -122.3491773},
    zoom: 12
  });
}

//put markers onto map
function drop(arr) {
    for (var i = 0; i < arr.length; i++) {
        addMarkerWithTimeout(arr[i], i*350);
    }
}

//add marker onto map with delay
function addMarkerWithTimeout(obj, timeout) {
    window.setTimeout(function() {
        //get time and day info
        var time = obj.datetime.slice(11, 16);
        var day = obj.datetime.slice(0, 10);
        //create description for marker info window
        var desc = '<div>' +
            '<h3>' +
            obj.address +
            '</h3>' +
            '<p>' +
            obj.type + ' at ' + time + ' on ' + day +
            '</p>' +
            '</div>'
        //create info window
        var info = new google.maps.InfoWindow({
            content: desc,
            maxWidth: 350
        });
        //create marker
        var m = new google.maps.Marker({
            title: obj.incident_number,
            position: {lat: parseFloat(obj.latitude), lng: parseFloat(obj.longitude)},
            map: map,
            animation: google.maps.Animation.DROP
        });
        //add marker to array
        markers.push(m);
        //add info div to sidebar
        var div = document.createElement('div')
        div.id = obj.incident_number;
        div.className = 'row';
        div.textContent = obj.incident_number;
        insertAfter(div, document.getElementById('top'));
        //open info window when clicked and highlight corresponding div
        m.addListener('click', function() {
            if (openWindow) {
                openWindow.close();
            }
            if (selectedDiv) {
                selectedDiv.removeAttribute('style');
            }
            info.open(map, m);
            var d = document.getElementById(obj.incident_number);
            d.style.backgroundColor = 'rgba(248, 148, 6, 1)';
            d.scrollIntoView(true);
            openWindow = info;
            selectedDiv = d;
        });
        div.addEventListener('click', function() {
            google.maps.event.trigger(m, 'click', {});
        });
    }, timeout);
}

//remove all markers from map
function clearMarkers() {
    while (markers.length > 0) {
        markers.pop().setMap(null);
    }
}

//drop the markers!
drop(data);
