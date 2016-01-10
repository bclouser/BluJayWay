
var SocketHandler = function(){
	this.socket = io.connect('http://192.168.33.10:3000/');
	this.coords = {lat:0.0, lng:0.0};
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
		zoom: 14
	});
	marker = new google.maps.Marker( {position: map.center, map: map} );
	marker.setMap( map );

	var socketHandler = new SocketHandler();
	socketHandler.onNewCoords( function(coords){
		console.log("Move marker");
		var latLng = new google.maps.LatLng( coords.lat, coords.lng );
		marker.setPosition( latLng );
		map.panTo( latLng );
	});
}