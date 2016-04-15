
var map;
// an object to hold all markers 
var markers = {};

var pannedMapYet = false;

// Make things pretty
var colorsList = [
	// http://www.colourlovers.com/palette/1930/cheer_up_emo_kid
	'556270',
	'4ECDC4',
	'C7F464',
	'FF6B6B',
	'C44D58',

	// http://www.colourlovers.com/palette/953498/Headache
	'655643',
	'80BCA3',
	'F6F7BD',
	'E6AC27',
	'BF4D28'
]

// the smooth zoom function
function smoothZoom (map, max, cnt) {
    if (cnt >= max) {
            return;
        }
    else {
        z = google.maps.event.addListener(map, 'zoom_changed', function(event){
            google.maps.event.removeListener(z);
            smoothZoom(map, max, cnt + 1);
        });
        setTimeout(function(){map.setZoom(cnt)}, 80); // 80ms is what I found to work well on my system -- it might not work well on all systems
    }
}  

$(function() {
	$('#simple-menu').sidr({
		side: 'right'
	});

	console.log("Sending request");
	$.ajax({
	    url: 'api/client/list',
	    type: 'GET',
	    success: function(data){ 
			var menuList = $('#menu-container ul');
			for(var i = 0; i<data.length; ++i){

				var menuItem ='<li><div class="menu-item">\
    							<h3 class="hostname">'+data[i]+'</h3>\
    							<label class="history-checkbx"><input type="checkbox" name="'+data[i]+'"> Display Path</label>\
    							<a class="download" name="'+data[i]+'"><span class="glyphicon glyphicon-save" aria-hidden="true"> (.KML)</span></a>\
  								</div></li>';

				menuList.append(menuItem);
			}
			$('#menu-container ul li').each(function(each){
				$(this).css(':hover {cursor:pointer}');


				// When a user modifies the drone display menu, we need to tell the server
				// the specifics of the message we want. THIS SHOULD BE CLIENT SPECIFIC!
				$(this).find('.history-checkbx input').click(function(){
					var clientName = this.name;
					if( $(this).is(':checked') ){
						console.log("Turning on history tracking for " + clientName);
						// Send a post request to the server telling we would like to start receiving history
						$.post( "api/client/set/historyReporting", {"clientName":clientName}, 
										function( data ) {
											console.log("Got data back");
											console.log(data);
											// Server will respond immediately with history, we need to draw the polyline on the map
						});
					}
					else{
						console.log("Turning OFF history tracking for " + clientName);
						// Send a post request to the server telling it that we no longer want data for this guy
						$.post( "api/client/set/historyReporting", {"clientName":clientName}, 
										function( data ) {
											console.log("Got data back");
											console.log(data);
										}
						);

						// Turn off it's current polyline
						markers[clientName].historyPathLine.setMap(null);
					}
				});
			});

			$('#menu-container .menu-item .download').click(function(){
				var clientName = this.name;
				console.log("Clicked on download kml file for " + clientName);
				var url = 'api/client/kmlcoords/'+clientName;
				var params = {};
				$.ajax({
				    type: "GET",
				    url:  url,
				    data: params,
				    success: function(response, status, request) {
				        var disp = request.getResponseHeader('Content-Disposition');
				        if (disp && disp.search('attachment') != -1) {
				            var form = $('<form method="GET" action="'+url+'">');
				            $.each(params, function(k, v) {
				                form.append($('<input type="hidden" name="' + k +
				                        '" value="' + v + '">'));
				            });
				            $('body').append(form);
				            form.submit();
				        }
				    }
				});
			});
	    },
	    error: function(data) {
	    	console.log("Getting list of clients in db failed");
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

function initMap(){
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 0, lng: 0},
		zoom: 1 // zoom as far out as possible
	});

	var socketHandler = new SocketHandler();
	socketHandler.onNewCoords( function(clientCoords){
		clientCoords.forEach(function(client){
			var latLng = new google.maps.LatLng( client.lat, client.lng );

			var contentString = '<div id="content">'+
			      '<div id="siteNotice">'+
			      '</div>'+
			      '<h3 id="firstHeading" class="firstHeading">'+client.host+'</h3>'+
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
				var path = marker.historyPathLine.getPath();
				if(client.config && client.config.keepHistory){
					console.log("Setting polyline");
					var latLng = new google.maps.LatLng( client.lat, client.lng );
					path.push(latLng);
					marker.historyPathLine.setMap(map);
				}
				else{
					// Turn off it's current polyline
					marker.historyPathLine.setMap(null);
					// clear the array
					//marker.historyPathLine.setPath([]);
					while(path.getLength() > 0) path.pop(); 
				}
			}
			// OK, it doesn't exist yet, create a new marker
			else{
				console.log(client.host + " doesnt exist yet, creating it");
				marker = new google.maps.Marker({
												position: latLng,
												map: map,
												title: client.host
											});

				marker.setMap( map );
				marker.infowindow = new google.maps.InfoWindow({
					content: contentString
				});

				// Add that polyline piece
				marker.historyPathLine = new google.maps.Polyline({
					strokeColor: '#FF0000',
					strokeOpacity: 1.0,
					strokeWeight: 2
				});

				// in case we want to have it stick with a click
				// google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
				//     return function() {
				//         infowindow.setContent(content);
				//         infowindow.open(map,marker);
				//     };
				// })(marker,contentString,marker.infowindow)); 


				google.maps.event.addListener(marker,'mouseover', (function(marker,content,infowindow){ 
				    return function() {
				        infowindow.setContent(content);
				        infowindow.open(map,marker);
				    };
				})(marker,contentString,marker.infowindow)); 

				google.maps.event.addListener(marker,'mouseout', (function(marker,infowindow){ 
				    return function() {
				        infowindow.close();
				    };
				})(marker,marker.infowindow));

				markers[client.host] = marker;
			}
			
			// Only do this once for the first gps coord we get from a client. after that, leave it alone
			if(!pannedMapYet){
				map.panTo( latLng );
				//map.setZoom(12);
				smoothZoom(map, 12, map.getZoom());
				pannedMapYet = true;
			}

			if(client.config){
				// be sure to keep our checkbox up to date
				console.log(client.host + " checked: " + client.config.keepHistory);
				$("#menu-container ul li input[name=\""+client.host+"\"]").prop('checked', client.config.keepHistory);
			}

		});
		
	});
}