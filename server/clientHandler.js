var state = {};
// Keep track of the latest coordinates received from gps client(s)
var latestCoords = [];

var globalUpdateInterval = null;

// All the browser sessions currently connected to our server
var viewingClients = [];

module.exports = {

	addClient: function(socket){

		viewingClients.push(socket);
		// There is only one timer for all connected viewing clients.
        // This call just ensures that the timer is enabled.
        this.enableTimer();

        // Since you are new here, we will give you the latest coords
        this.publishCoords(socket);
	},

	removeClient: function(socket){
		viewingClients.splice(viewingClients.indexOf(socket), 1);
		this.disableTimer();
	},

	updateState: function(name, config){
		var index = -1;
		// If we don't have any coords, we don't update anything
		for(var i = 0; i<latestCoords.length; ++i){
		    if(latestCoords[i].host == name){
		        index = i;
		        break;
		    }
		}
		if( index !== (-1) ){
			latestCoords[i].config = config;		
		}
		else{
			// doesn't exist yet, so add it.
			latestCoords.push({'config':config});
		}
		console.log("Updated state: ");
		console.log(latestCoords);
	},

	publishCoords: function(webSocket){
    	console.log("Publishing coords to client!");
    	webSocket.emit('coords', latestCoords);
	},

	enableTimer: function(){
		console.log("Enabling the timeout");
		if(!globalUpdateInterval){
			globalUpdateInterval = setInterval(this.timerCallbackFunction, 2000);
		}
		// else timer already set, do nothing
	},

	disableTimer: function(){
		console.log("disabling the timer and callback");
		clearInterval(globalUpdateInterval);
		globalUpdateInterval = null;
	},

	timerCallbackFunction: function(){
		for(var i = 0; i<viewingClients.length; ++i){
			viewingClients[i].emit('coords', latestCoords);
		}
	},

	currentlyTracking: function(clientName){
		console.log("name = " + clientName);
		for(var i = 0; i<latestCoords.length; ++i){
		    if(latestCoords[i].host == clientName){
		    	if(latestCoords[i].config){
		    		console.log("Config object:");
		    		console.log(latestCoords[i].config);
		    		return latestCoords[i].config.keepHistory;
		    	}
		    }
		}
		return false;
	},

	addCoords: function(coordObject){
		// Do we already exist in this array?
		var index = -1;
		for(var i = 0; i<latestCoords.length; ++i){
		    if(latestCoords[i].host == coordObject.host){
		        index = i;
		        break;
		    }
		}

		if(index !== -1){
			// Are we trying to save this guy's breadcrumbs
			if( latestCoords[index].config ){
				// copy these first
				latestCoords[index].lat = coordObject.lat;
				latestCoords[index].lng = coordObject.lng;
				latestCoords[index].alt = coordObject.alt;
				// I don't care about the host parameter
				delete coordObject.host;
				// add this current coordinate to the history of coords
				if(!latestCoords[index].history){
					latestCoords[index].history = [];
				}
				latestCoords[index].history.push(coordObject);
			}
			else{
				// if we aren't concerned with keeping the history, just overwrite object
			    latestCoords[index] = coordObject;
			}
		}
		else{
		    // first time here!
		    latestCoords.push(coordObject);
		}
	}
}


