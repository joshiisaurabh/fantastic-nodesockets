var express = require('express');
var fs = require('fs');
var socket = require('socket.io');
var User = require('./schema');
 var https = require('https');

 var myParser = require("body-parser");



// App setup
var app = express();
 app.use(myParser.urlencoded({extended : true}));

var server=https.createServer({
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem')
    }, app).listen(4000,"0.0.0.0");

//var server = app.listen(4000,"0.0.0.0", function(){
  //  console.log('listening for requests on port 4000,');
//});




// This responds a GET request for abcd, abxcd, ab123cd, and so on
app.get('/find', function(req, res) {  
 
   User.find({}, function(err, users) {
  if (err) throw err;
  
  // object of all the users
  console.log(users);
res.send(users)

});

})

// This responds a GET request for the /list_user page.
app.post('/addMsg', function (req, res) {
  // console.log("Got a GET request for /list_user",req);
//console.log(JSON.stringify(req.url));
var s=req.url.split("?")
 console.log(req.connection.remoteAddress)
var obj=s[1].split("*")
var msg=obj[0]
var handler=obj[1]
console.log(msg,handler)
  var newUser = User({
  msg:msg,
  handler:handler
  });

// save the user
newUser.save(function(err) {
  if (err) throw err;
res.send('message send created!');
  console.log('User created!');
 
});

  
})

// Static files
app.use(express.static('public'));

// Socket setup & pass server
var io = socket(server);
io.on('connection', (socket) => {

    console.log('made socket connection', socket.id);

    // Handle chat event
    socket.on('chat', function(data){
        // console.log(data);
        io.sockets.emit('chat', data);
    });

    // Handle typing event
    socket.on('typing', function(data){
        socket.broadcast.emit('typing', data);
    });

});
