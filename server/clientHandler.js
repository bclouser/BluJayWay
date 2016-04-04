var state = {};
// Keep track of the latest coordinates received from gps client(s)
var latestCoords = [];

var globalUpdateInterval = null;

// All the browser sessions currently connected to our server
var viewingClients = [];

module.exports = {
	state: state,


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

	publishCoords: function(webSocket){
    	console.log("Publishing coords to client!");
    	webSocket.emit('coords', latestCoords);
	},

	enableTimer: function(){
		console.log("Enabling the timeout");
		if(!globalUpdateInterval){
			globalUpdateInterval = setInterval(this.timerCallbackFunction, 3000);
		}
		// else timer already set, do nothing
	},

	disableTimer: function(){
		console.log("disabling the timer and callback");
		clearInterval(globalUpdateInterval);
		globalUpdateInterval = null;
	},

	timerCallbackFunction: function(){
		console.log("In callback. Sending coords.");
		for(var i = 0; i<viewingClients.length; ++i){
			viewingClients[i].emit('coords', latestCoords);
		}
	},

	addCoords: function(coordObject){
		// Do we already exist in this array?
		var index = -1;
		for(var i = 0; i<latestCoords.length; ++i){
		    if(latestCoords[i].host == message.host){
		        index = i;
		        break;
		    }
		}

		if(index !== -1){
		    latestCoords[index] = coordObject;
		}
		else{
		    // first time here!
		    latestCoords.push(coordObject);
		}
	}
}


