
var monk = require('monk');
var db = monk('localhost:27017/blueJay');


  // Keep track of the latest coordinates received from gps client(s)
  latestCoords = [];
  // Keep track of the connected clients
  clients = [];


module.exports.init = function(net, io)
{
    // Start a TCP Server
    net.createServer(function (socket) {

    // Identify this client
    socket.name = socket.remoteAddress + ":" + socket.remotePort 

    // Put this new client in the list
    clients.push(socket);

    // I thought about making caped collections in our db....
    // For now though, we are not limiting the collections history

    // Send a nice welcome message and announce
    socket.write("Welcome " + socket.name + "\n");

    // Handle incoming messages from clients.
    socket.on('data', function (data) {
        //console.log("Got data from socket: "+ data);
        message = JSON.parse(data);
        console.log(message);
        if(message && message.lat && message.lng && message.host){

            var alt = -1;
            if(message.alt != null){
                alt = message.alt;
            }

            // Do we already exist in this array?
            var index = -1;
            for(var i = 0; i<latestCoords.length; ++i){
                if(latestCoords[i].host == message.host){
                    index = i;
                    break;
                }
            }

            var coordObject = {host: message.host, lat:message.lat, lng:message.lng, alt:message.alt};
            if(index !== -1){
                latestCoords[index] = coordObject;
            }
            else{
                // first time here!
                latestCoords.push(coordObject);
            }

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

            // Yeah, we need to start specifying which gps client these coords belong.
            // We should send this out on a constant period. Not everytime someone updates coords
            console.log("Sending coords to all web clients");
            io.sockets.emit('coords', latestCoords);
        }
        //broadcast(socket.name + "> " + data, socket);
    });

    // Remove the client from the list when it leaves
    socket.on('end', function () {
        clients.splice(clients.indexOf(socket), 1);
        broadcast(socket.name + " left.\n");
    });
    
    // Send a message to all clients
    function broadcast(message, sender) {
        clients.forEach(function (client) {
            // Don't want to send it to sender
            if (client === sender){
                return;
            }
            client.write(message);
        });
        // Log it to the server output too
        process.stdout.write(message)
    }

  }).listen(5000);

  // Put a friendly message on the terminal of the server.
  console.log("Server running at port 5000\n");
};

module.exports.publishCoords = function(webSocket){
    console.log("Publishing coords to client!");
    // latestCoords is a global guy updated within the server
    webSocket.emit('coords', latestCoords);
};