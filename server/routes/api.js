var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

var clientHandler = require('../clientHandler');

// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
// Not actually using this... it can be commented out for now
//var urlencodedParser = bodyParser.urlencoded({ extended: false })


var msTillInactive = 20000; // 20 seconds


function getHistoryPromise(db, clientName, startRange, endRange){
	console.log("name = " + clientName + " startRange = " + startRange + " endRange " + endRange);
	var promise = new Promise(function(resolve, reject){

		var collection = db.get(clientName);

		if(collection == null){
			console.log("Couldn't find collection");
			reject(Error("Couldn't find collection"));
			return;
		}

		if(startRange == null){
			startRange = 0
		}
		if(endRange == null){
			// This code will stop working on my 100th birthday
			endRange = new Date(2091,02,12).getTime();
		}

		collection.find({timestamp:{$gte:startRange, $lte:endRange}}, {sort:{timestamp:-1}}, function(err, docs){
			if(err != null){
				console.log("Failed to get list of coordinates in specified range");
				console.log(err);
				reject(err);
				return;
			}

			// return all coordinate documents found in specified range
			resolve(docs);
		});

	});

	return promise;
}


// Return a list of all the clients past and present in our system
router.get('/client/list', function(req, res) {
	console.log("Got a request for /client/list" );
	//res.json({something:"someone"});

	// Beginning to actively dislike monk.
    var db = req.db;
   // db.on("open",function() {
		db.driver._native.command({ "listCollections": 1 },
					function(err,result) {
						if(err !== null){
							if(result == null){
								res.json({response:null});
							}
							console.log(result);
							var collections = result.cursor.firstBatch.map(function(el){ return el.name;});
							console.log(collections);
							res.json(collections);
						}
						else{
							console.log("caught an error while trying to fetch collections");
							res.json({error:true});
						}
					});
	//});
});

// Returns list of drone host names that we are currently reporting history (more than current coords)
router.get('/client/status/historyReporting', function(req, res) {

});

router.post('/client/set/historyReporting', jsonParser, function(req, res) {
	console.log("Got POST request for historyReporting");
	var clientName = req.body.clientName;
	var startRange = req.body.startRange;
	var endRange = req.body.endRange;
	// validate input real quick
	if( clientName){
		console.log("Got valid request to set the historyReporting");

		// Update global object so everyone else knows to send history updates for this client
		var config = {
			keepHistory:true,
			startRange:startRange,
			endRange:endRange
		}

		clientHandler.updateState(clientName, config);

		// Send response with history for requested client.
		var promise = getHistoryPromise(req.db, clientName, startRange, endRange);
		promise.then(function(result){
			res.json(result);
		}, 
		function(err){
			res(err);
		});
	}
	else{
		console.log("Did not get all necessary parameters needed from the request");
		res.json({error:true});
	}
});

// Return status of specified client
router.get('/client/status/:clientName', function(req, res) {
	console.log("Got a request for the status of client: " + req.params.clientName);
	var db = req.db;
	var collection = db.get(req.params.clientName);

	if(collection == null){
		console.log("Couldn't find collection");
		res.json({error:true});
		return;
	}

	var clientActive = false;
	var lastRecordedTime = 0;
	var firstRecordedTime = 0;
	//console.log(collection)
	// Get latest received gpsCoord
	collection.findOne({},{sort:{timestamp:-1}},function(err,doc){
		if(err != null){
			console.log("Failed to get most recent document for client");
			console.log(err);
			res.json({error:true});
			return;
		}
		else{
			if(doc == null){
				console.log("empty response for most recent document");
				res.json({error:true});
				return;
			}
			var lastRecordedTime = doc.timestamp;
			var currentMsSinceEpoch = new Date().getTime();
			// if we got an update in the last 15 seconds, call it active.
			if(  (currentMsSinceEpoch - lastRecordedTime) <=  msTillInactive ){
				clientActive = true;
			}

			// Ok, now get the very first entry for this client
			collection.findOne({},{sort:{timestamp:1}},function(err,doc){
				if(err != null){
					console.log("Failed to get first ever document for client");
					console.log(err);
					res.json({error:true});
					return;
				}
				else{
					if(doc == null){
						console.log("empty response for first ever document");
						res.json({error:true});
						return;
					}
					else{
						firstRecordedTime = doc.timestamp;
						console.log({active:clientActive, lastRecordedTime:lastRecordedTime, firstRecordedTime:firstRecordedTime});
		    			res.json({active:clientActive, lastRecordedTime:lastRecordedTime, firstRecordedTime:firstRecordedTime});
		    		}
				}
			});
		}
	});
});

// Return list of coordinate objects for the given time range specified
router.get('/client/coords/:clientName', jsonParser, function(req, res) {
	console.log("Got a request for the coords of client: " + req.params.clientName);

	var promise = getHistoryPromise(req.db, req.params.clientName, req.body.startRange, req.body.endRange);
	promise.then(function(result){
		res.json(result);
	},
	function(err){
		res(err);
	});
});

module.exports = router;

