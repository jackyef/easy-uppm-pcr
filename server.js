var express = require('express');
var app = express();
var fs = require('fs');
app.set('view engine', 'ejs');

const port = process.env.PORT || "8000";
app.listen(port, function() {
  console.log(`Easy UPPM is running on port ${port}!`)
});

// index page 
app.get('/', function(req, res) {
  var data = {};
  data.uppm = JSON.parse(fs.readFileSync('uppm.json', 'utf-8'));
  res.render('index', data);
});