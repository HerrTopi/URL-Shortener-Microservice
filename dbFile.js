console.log("okkk");
var express = require('express');
var router = express.Router();
var path    = require("path");
var mongoose = require('mongoose');
var connection =mongoose.connect('mongodb://herrtopi:herrtopi@ds031893.mlab.com:31893/herrtopi');


var Schema = mongoose.Schema;


var urlSchema = new Schema({
		original:String,
		shortened:String
	});

var url = connection.model('url', urlSchema);

function validateUrl(value) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

router.get('/', function (req, res) {
 res.sendFile(path.join(__dirname+'/index.html'));
})

router.get('/new/*', function(req, res, next){
    var fullUrl=req.protocol + '://' + req.get('host')+"/";
    var passedUrl=req.url.slice( 5 );
    if(validateUrl(passedUrl)){
	url.find({original:passedUrl},function(err,myUrl){
	    if(err){
	        res.end("error");
	    }
        if(myUrl.length>0){
            res.json({original:passedUrl,shortened:fullUrl+myUrl[0].shortened});
        }else{
            url
              .findOne()
              .sort('-shortened')  // give me the max
              .exec(function (err, myurl) {
                  if(!myurl){var newShortened=0;}else{
                      var newShortened=parseInt(myurl.shortened)+1;
                  }
                 var newUrl= new url({original:passedUrl,shortened:newShortened});
                      newUrl.save(function (err) {
                      if (err) return handleError(err);
                      return res.send({original:passedUrl,shortened:fullUrl+newShortened});
                    })
              });
        }
	});}else{
	   res.send("Invalid URL, for more information please visit: https://en.wikipedia.org/wiki/URL");
	}
    
});

router.get('/:shortenedurl', function(req, res, next){
   	url.find({shortened:req.params.shortenedurl},function(err,fullUrl){
   	    if(fullUrl.length>0){
   	        res.redirect(fullUrl[0].original);
   	    }else{
   	        res.send("This url does not belongs to any record!");
   	    }
     
   	});
});
module.exports = router;