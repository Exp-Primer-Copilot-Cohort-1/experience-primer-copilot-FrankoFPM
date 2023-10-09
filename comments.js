// Create web server
var express = require('express');
var app = express();
// create http server
var server = require('http').createServer(app);
// create socket server
var io = require('socket.io')(server);
// create redis client
var redis = require('redis');
var redisClient = redis.createClient();
// use redis as database
var db = require('./models');

// use express to serve static files
app.use(express.static(__dirname + '/public'));

// subscribe to comments channel
redisClient.subscribe('comments');

// listen to comments channel
redisClient.on('message', function(channel, message) {
  // emit new comment to all clients
  io.emit('new comment', JSON.parse(message));
});

// use socket.io to listen to new connections
io.on('connection', function(client) {
  console.log('Client connected...');

  // listen to new comment event
  client.on('new comment', function(data) {
    // save comment to database
    db.Comment.create(data).then(function(comment) {
      // emit new comment to all clients
      io.emit('new comment', comment);
    });
  });
});

// start server
server.listen(3000, function() {
  console.log('Server running on port 3000...');
});
