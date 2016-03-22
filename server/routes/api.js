var express = require('express');
var router = express.Router();

var msTillInactive = 20000; // 20 seconds

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
router.get('/client/coords/:clientName', function(req, res) {
	console.log("Got a request for the coords of client: " + req.params.clientName);

	var db = req.db;
	var collection = db.get(req.params.clientName);

	if(collection == null){
		console.log("Couldn't find collection");
		res.json({error:true});
		return;
	}

	var beginRange = 0;
	// This code will stop working on my 100th birthday
	var endRange = new Date(2091,02,12).getTime();
	if(req.params.beginRange != null){
		startRange = req.params.startRange;
	}
	if(req.params.endRange != null){
		endRange = req.params.endRange;
	}

	collection.find({timestamp:{$gte:beginRange, $lte:endRange}}, {sort:{timestamp:-1}}, function(err, docs){
		if(err != null){
			console.log("Failed to get list of coordinates in specified range");
			console.log(err);
			res.json({error:true});
			return;
		}

		// return all coordinate documents found in specified range
		res.json(docs);
		
	});
});

module.exports = router;