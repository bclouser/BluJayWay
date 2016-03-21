var express = require('express');
var router = express.Router();

router.get('/hostList', function(req, res) {
	console.log("Got a request for hostlists");
	res.json({something:"someone"});

	// Beginning to actively dislike monk.
    /*var db = req.db;
    db.on("open",function() {
		db.driver._native.command({ "listCollections": 1 },
					function(err,result) {
						if(err !== null){
							var collections = result.cursor.firstBatch.map(function(el){ return el.name;});
							 res.json(collections);
						}
						else{
							console.log("caught an error while trying to fetch collections");
						}
					});
	});*/
});

module.exports = router;