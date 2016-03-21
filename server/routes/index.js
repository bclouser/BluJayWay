
module.exports = function(io, tcpServer) {
    var express = require('express');
    var router = express.Router();
    var secrets = require('../secrets');

    /* GET home page. */
    router.get('/', function(req, res, next) {
      res.render('index', { googleMapsApiKey: secrets.getGoogleMapsApiKey() });
    });

    // Handle connection from new web client
    // This is likely a browser window
    io.on('connection', function(socket) { 
        console.log("Got connection");

        // We have a new listener, give them the latest coords
        tcpServer.publishCoords(socket);
    });

    return router;
}
