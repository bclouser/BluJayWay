
module.exports = function(io, tcpServer) {
    var express = require('express');
    var router = express.Router();
    var secrets = require('../secrets');
    var clientHandler = require('../clientHandler');

    /* GET home page. */
    router.get('/', function(req, res, next) {
      res.render('index', { googleMapsApiKey: secrets.getGoogleMapsApiKey() });
    });

    var numViewingClients = 0;
    // Handle connection from new web client
    // This is likely a browser window
    io.on('connection', function(socket) { 
        ++numViewingClients;
        console.log("Got connection. " + numViewingClients + " currently viewing");
        
        clientHandler.addClient(socket);
    });

    io.on('disconnect', function(socket){
        --numViewingClients;
        console.log("Lost connection. " + numViewingClients + " currently viewing");

        if(numViewingClients == 0){
            clientHandler.disableTimer();
        }
    });

    return router;
}
