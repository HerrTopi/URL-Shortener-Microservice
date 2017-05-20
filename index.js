var express = require('express')
var app = express()

var dbFile = require('./dbFile');
app.use('/', dbFile);


app.listen(process.env.PORT, function () {
  console.log('Example app listening on port '+process.env.PORT+'!')
})