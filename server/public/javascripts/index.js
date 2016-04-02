
var currentlyTracking = false;

$(function() {
	// When a user modifies the drone display menu, we need to tell the server
	// the specifics of the message we want. THIS SHOULD BE CLIENT SPECIFIC!
	$('#BensFakeHost').click(function(){
		if(currentlyTracking){
			console.log("Turning tracking off");
			// Send a post request to the server telling it that we no longer want data for this guy
			$.post( "ajax/test.html", function( data ) {
				$( ".result" ).html( data );
			});

			// Turn off it's current polyline

			// Set 
			currentlyTracking = false;
		}
		else{
			console.log("Turning tracking on");

			// Send a post request to the server telling we would like to start receiving history
			$.post( "ajax/test.html", function( data ) {
				$( ".result" ).html( data );
				// Server will respond immediately with history, we need to draw the polyline on the map
			});

			// Set 
			currentlyTracking = true;
		}
	});
});


var SocketHandler = function(){
	console.log(window.location.href);
	// Figure out our server location based on url... kind of clunky
	var url = window.location.href;
	var urlSplit = url.split('/');
	//    http://testpit.benclouser.com/blah/blah/blah
	this.socket = io.connect(urlSplit[0]+'//'+urlSplit[2]);
	this.clientCoords = [];
	var self = this;

	this.socket.on('coords', function(data) {
		console.log("received");
		console.log(data);
		//TODO, validate!
		self.coordsCallback(data);
	});
}

SocketHandler.prototype.coordsCallback = function(data){
	console.log("No callback registered yet");
}

SocketHandler.prototype.onNewCoords = function(handler){
	if (handler && typeof(handler) === "function") {
		this.coordsCallback = handler;
	}
}

var map;
function initMap(){
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 38.954, lng: -77.346},
		zoom: 15
	});

	// an object to hold all markers 
	var markers = {};
	var socketHandler = new SocketHandler();
	socketHandler.onNewCoords( function(clientCoords){
		clientCoords.forEach(function(client){
			console.log("Move marker for host " + client.host);
			var latLng = new google.maps.LatLng( client.lat, client.lng );

			var contentString = '<div id="content">'+
			      '<div id="siteNotice">'+
			      '</div>'+
			      '<h1 id="firstHeading" class="firstHeading">'+client.host+'</h1>'+
			      '<div id="bodyContent">'+
			      '<ul>'+
			      '<li> '+client.lat+', '+client.lng+' </li>' +
			      '<li> Alt: '+client.alt+'\' </li>' +
			      '<li> Speed: '+client.speed+' Mph </li>' +
			      '</ul>'+
			      '</div>'+
			      '</div>';

			
			// See if it exists within our container of markers
			if(markers[client.host]){
				console.log(client.host + " Exists already");
				markers[client.host].setPosition(latLng);
				markers[client.host].infowindow.setContent(contentString);
			}
			// OK, it doesn't exist yet, create a new marker
			else{
				console.log(client.host + " doesnt exist yet, creating it");
				marker = new google.maps.Marker({
												position: map.center,
												map: map,
												title: client.host
											});

				marker.setMap( map );
				marker.infowindow = new google.maps.InfoWindow({
					content: contentString
				});

				google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
				    return function() {
				        infowindow.setContent(content);
				        infowindow.open(map,marker);
				    };
				})(marker,contentString,marker.infowindow)); 

				markers[client.host] = marker;
			}

			// check if history is turned on for this host, how many history points? Limit by time maybe?
			if(true){
				// We also might want to have a button that only displays active drones. Just a thought
				//if(client.active){


			}
			
			//map.panTo( latLng );
		});
		
	});
}