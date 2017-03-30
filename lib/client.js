'use strict';

const net = require('net');

const client = new net.Socket();

client.connect(8192, '127.0.0.1', () => {
    console.log('Client connected');
    client.write('Ping')
});

client.on('data', data => {
    console.log(`Received ${data}`);
});

client.on('close', () => {
    console.log('Connection closed');
});
