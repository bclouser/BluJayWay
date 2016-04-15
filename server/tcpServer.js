
var monk = require('monk');
var db = monk('localhost:27017/blueJay');

var clientHandler = require('./clientHandler');

// Keep track of the connected clients. (Drones)
var clients = [];

module.exports.init = function(net, io)
{
    // function called everytime a connection is made
    net.createServer(function (socket) {
        // Identify this client
        socket.name = socket.remoteAddress + ":" + socket.remotePort 

        // Put this new client in the list
        clients.push(socket);

        // I thought about making capped collections in our db....
        // For now though, we are not limiting the collections history

        // Handle incoming messages from clients.
        socket.on('data', function(data) {
            message = JSON.parse(data);
            //console.log("on data:"); console.log(message);
            if(message && message.lat && message.lng && message.host){

                var alt = -1;
                if(message.alt != null){
                    alt = message.alt;
                }

                var speed = -1;
                if(message.speed != null){
                    speed = message.speed;
                }

                var coordObject = {host: message.host, lat:message.lat, lng:message.lng, alt:alt, speed:speed};

                clientHandler.addCoords(coordObject);

                var d = new Date();
                var msSinceEpoch  = d.getTime();
                // Get the existing collection for this host, or create a new one.
                collection = db.get(message.host);
                collection.insert({
                                    lat:message.lat,
                                    lng:message.lng,
                                    alt:message.alt,
                                    timestamp: msSinceEpoch
                                }, function(err, doc){
                                    if(err !== null){
                                        console.log("Inserting failed for clients message");
                                        console.log(err);
                                    }
                                });
                socket.end();
            }
        });

        // Remove the client from the list when it leaves
        socket.on('end', function () {
            //console.log("Client disconnected");
            clients.splice(clients.indexOf(socket), 1);
        });
  }).listen(5000);

  // Put a friendly message on the terminal of the server.
  console.log("Server running at port 5000\n");
};



