// main.js - sets up the visualization's map and other useful functions

// GLOBALS
var map;
var markers = [];
var openWindow = null;
var selectedDiv = null;
var picker = new Pikaday(
{
    field: document.getElementById('custom'),
    format: 'YYYY-MM-DD',
    minDate: moment("2010-06-01").toDate(),
    maxDate: moment().subtract(1, 'days').toDate()
});
var baseURL = 'https://data.seattle.gov/resource/grwu-wqtk.json?$order=datetime+ASC&$limit=100000';
var dtFormatString = 'YYYY-MM-DDTHH:mm:ss.SSS'
var lastUpdate;
var newData = [];
var uids = {};

// FUNCTIONS
//insert a newNode after targetNode as a sibling -- thanks stackoverflow
function insertAfter(newNode, targetNode) {
    var p = targetNode.parentNode;
    if (p.lastchild === targetNode) {
        p.appendChild(newNode);
    } else {
        p.insertBefore(newNode, targetNode.nextsibling);
    }
}

//initialize map must be called before anything is added to the map!
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    //approx seattle city center
    center: {lat: 47.6044446, lng: -122.3491773},
    zoom: 12
  });
}

//put data points in arr on the map
function drop(arr) {
    for (var i = 0; i < arr.length; i++) {
        addMarkerWithTimeout(arr[i], i*250);
    }
}

//add marker onto map with delay
function addMarkerWithTimeout(obj, timeout) {
    window.setTimeout(function() {
        // DATA PROCESSING
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
        //select which image to use based on obj.type
        //defualt is fire.png
        var imgPath;
        if (obj.type.startsWith('Medic')) {
            imgPath = '/static/img/ambulance.png';
        } else if (obj.type.startsWith('Aid')) {
            imgPath = '/static/img/helmetcross.png';
        } else if (obj.type.startsWith('Rescue') || obj.type.startsWith('Alarm')) {
            imgPath = '/static/img/firetruck.png';
        } else {
            imgPath = '/static/img/fire.png';
        }

        // CREATE OBJECTS/NODES
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
        var rowDiv = document.createElement('div');
        rowDiv.id = obj.incident_number;
        rowDiv.className = 'row';
        //create imgDiv
        var imgDiv = document.createElement('div');
        imgDiv.className = 'col';
        var img = document.createElement('img');
        img.src = imgPath;
        img.style.height = '60px';
        imgDiv.appendChild(img);
        rowDiv.appendChild(imgDiv);
        //create timeDiv
        var timeDiv = document.createElement('div');
        timeDiv.className = 'col';
        timeDiv.innerHTML += '<p>' + time + '<br>' + day + '</p>';
        rowDiv.appendChild(timeDiv);
        //create descDiv
        var descDiv = document.createElement('div');
        descDiv.className = 'col';
        descDiv.innerHTML += '<p>' + obj.incident_number + '<br>' + obj.type + '</p>';
        rowDiv.appendChild(descDiv);
        insertAfter(rowDiv, document.getElementById('top'));

        // EVENT LISTENERS
        //closing an info window sets openWindow and selectedDiv to null
        info.addListener('closeclick', function() {
            if (openWindow) {
                openWindow = null;
            }
            if (selectedDiv) {
                selectedDiv.removeAttribute('style');
                selectedDiv = null;
            }
        });
        //clicking marker opens an info window and highlights div
        m.addListener('click', function() {
            //close and deselect previous
            if (openWindow) {
                openWindow.close();
            }
            if (selectedDiv) {
                selectedDiv.removeAttribute('style');
            }
            info.open(map, m);
            var d = document.getElementById(obj.incident_number);
            d.style.backgroundColor = 'rgba(244, 179, 80, 1)';
            d.scrollIntoView(true);
            openWindow = info;
            selectedDiv = d;
        });
        //clicking div is the same as clicking corresponding marker
        rowDiv.addEventListener('click', function() {
            google.maps.event.trigger(m, 'click', {});
        });
    }, timeout);
}

//remove all markers from map
function clearMarkers() {
    while (markers.length > 0) {
        markers.pop().setMap(null);
    }
    openWindow = null;
    selectedDiv = null;
}

//retrieve fresh data from seattle open data using user-supplied start date (default is yesterday)
function getData() {
    //clear the previous markers
    clearMarkers();
    var userSelection = document.querySelector('input[name="startdate"]:checked').id;
    //get starttime as a moment object
    var startDate = moment().tz("US/Pacific");
    switch (userSelection) {
        case 'other':
            startDate = moment(document.getElementById('custom').value);
            //alert user if input is bad
            if (!startDate.isValid()) {
                alert("Enter a date with the format 'YYYY-MM-DD'");
                return;
            }
            break;
        //last week
        case 'lastweek':
            startDate = startDate.subtract(1, 'weeks');
            break;
        //three days ago
        case '3daysago':
            startDate = startDate.subtract(3, 'days');
            break;
        //use yesterday setting as default
        default:
            startDate = startDate.subtract(1, 'days');
    }
    //set latest update to now
    var lastUpdate = moment().tz("US/Pacific");
    var url = [baseURL, `$where=datetime+between+'${startDate.format(dtFormatString)}'+and+'${lastUpdate.format(dtFormatString)}'`].join('&');
    httpGET(url);
    if (newData.length > 0) {
        console.log("yes");
        //set number of incidents
        document.getElementById('incidents').innerHTML = newData.length;
        //drop the markers!
        drop(newData);
    } else {
        console.log("no");
    }
}

//send an http GET request with the supplied url
function httpGET(url) {
    console.log(url);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        //clear previous newData
        while (newData.length > 0) {
            newData.pop();
        }
        if (xhr.readyState !== 4 || xhr.status !== 200) return;
        newData = JSON.parse(xhr.responseText);
    }
    xhr.send();
}

// MAIN
//create the map!
initMap();
//drop the markers!
drop(data);
//send get request to retrieve new data on an interval
//interval at 2 mins
// setInterval(function() {
//     var xhr = new XMLHttpRequest();
//     xhr.open('GET', '/refresh', true);
//     xhr.onreadystatechange = function() {
//         if (xhr.readyState != 4 || xhr.status != 200) return;
//         newData = JSON.parse(xhr.responseText);
//     };
//     xhr.send();
//     if (newData.length > 0) {
//         drop(newData);
//     } else {
//         console.log('No new data to drop');
//     }
// }, 1000*60*2);

