// main.js - sets up the visualization's map and other useful functions

// GLOBALS
//user interface
var map;
var markers = [];
var divs = [];
var openWindow = null;
var selectedDiv = null;
//data structures
var allData = [];
var newData = [];
var uids = {};
//smaller stuff
var picker = new Pikaday(
{
    field: document.getElementById('custom-other'),
    format: 'YYYY-MM-DD',
    minDate: moment("2010-06-01").toDate(),
    maxDate: moment().subtract(1, 'days').toDate()
});
var baseURL = 'https://data.seattle.gov/resource/grwu-wqtk.json?$order=datetime+ASC&$limit=100000';
var dtFormatString = 'YYYY-MM-DDTHH:mm:ss.SSS'
var startDT, stopDT, lastUpdate;
var to;

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
        addMarkerWithTimeout(arr[i], i*50);
    }
}

//add marker onto map with delay
function addMarkerWithTimeout(obj, timeout) {
    to = window.setTimeout(function() {
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
        //add marker and div to respective arrays
        markers.push(m);
        divs.push(rowDiv);

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

//resets interface to have nothing in sidebar and an empty map
function resetInterface() {
    //remove incidents
    document.getElementById('incidents').innerHTML = "0";
    //identifiers
    openWindow = null;
    selectedDiv = null;
    //clear arrays
    while (markers.length > 0)
        markers.pop().setMap(null);
    while (divs.length > 0) {
        var d = divs.pop();
        d.parentNode.removeChild(d);
    }
}

//retrieve fresh data from seattle open data using user-supplied start date (default is yesterday)
function getData() {
    //reset map
    resetInterface();
    var userSelection = document.querySelector('input[name="startdate"]:checked').id;
    //get starttime as a moment object
    startDT = moment().tz("US/Pacific");
    //hold user input
    var x;
    switch (userSelection) {
        case 'hour':
            x = validateInteger(document.getElementById('custom-hour').value);
            //alert on invalid input
            if (x === -1) {
                alert("Enter a positive integer for hours!");
                return;
            }
            startDT.subtract(x, 'hours');
            break;
        case 'day':
            x = validateInteger(document.getElementById('custom-day').value);
            //alert on invalid input
            if (x === -1) {
                alert("Enter a positive integer for days!");
                return;
            }
            startDT.subtract(x, 'days');
            break;
        case 'week':
            x = validateInteger(document.getElementById('custom-week').value);
            //alert on invalid input
            if (x === -1) {
                alert("Enter a positive integer for weeks!");
                return;
            }
            startDT.subtract(x, 'weeks');
            break;
        case 'other':
            startDT = moment(document.getElementById('custom-other').value);
            //alert user if input is bad
            if (!startDT.isValid()) {
                alert("Enter a date with the format 'YYYY-MM-DD'");
                return;
            }
            break;
        //use yesterday setting as default
        default:
            startDT = startDT.subtract(1, 'days');
    }
    //set latest update to now
    stopDT = moment().tz("US/Pacific");
    httpGET(createURL(), getNewData);
}

//returns a url to hit based on startDT and stopDT
function createURL() {
    return [baseURL, `$where=datetime+between+'${startDT.format(dtFormatString)}'+and+'${stopDT.format(dtFormatString)}'`].join('&');
}

//recreates allData array with new data
function getNewData(data) {
    //ensure allData and uids are empty
    while (allData.length > 0)
        allData.pop();
    for (var p in uids)
        if (uids.hasOwnProperty(p))
            delete uids[p];
    //change number of incidents
    document.getElementById('incidents').innerHTML = data.length;
    //iterate over datapoints
    for (var i = 0; i < data.length; i++) {
        //add uid
        uids[data[i].incident_number] = true;
        //add datapoint
        allData.push(data[i]);
    }
    //drop the data to reflect changes
    drop(allData);
}

//return a positive integer from a string or -1
function validateInteger(s) {
    var x = parseInt(s);
    return (!isNaN(x) && x > 0) ? x : -1;
}

//adds additional data to existing allData array
function addNewData(data) {
    //ensure newData is empty
    while (newData.length > 0)
        newData.pop();
    //number of incidents
    var incidents = document.getElementById('incidents');
    var n = parseInt(incidents.innerHTML);
    //iterate over new datapoints
    for (var i = 0; i < data.length; i++) {
        //add data point if the incident number is not in uids
        if (!uids.hasOwnProperty(data[i].incident_number)) {
            //add to uids
            uids[data[i].incident_number] = true;
            //add to newData
            newData.push(data[i]);
            //increment incidents
            n++;
        }
    }
    //change number of incidents and drop any new data
    incidents.innerHTML = n;
    drop(newData);
    //save stopDT if there actually was data
    if (data.length > 0)
        lastUpdate = stopDT;
}

//send an http GET request with the supplied url
//executes callback with the response text as an arguement
function httpGET(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200)
            callback(JSON.parse(xhr.responseText));
    }
    xhr.open('GET', url, true);
    xhr.send();
}

// MAIN
//create the map!
initMap();
//auto load data from yesterday
getData();
//load more data every 5 mins
setInterval(function() {
    console.log('looking for update...');
    //start from the latest update
    startDT = lastUpdate;
    //stop at now
    stopDT = moment().tz("US/Pacific");
    httpGET(createURL(), addNewData);
}, 1000*60*5);

