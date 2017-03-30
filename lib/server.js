'use strict';

const net = require('net');

const server = net.createServer(socket => {
    console.log('Client connected');
    socket.on('end', () => console.log('Client disconnected'));
    socket.pipe(socket);
});

server.on('error', error => {
    console.log(error);
});

server.start = function(callback){
    server.listen(8192, callback);
};

server.stop = function(callback){
    server.close(callback);
};

module.exports = server;
