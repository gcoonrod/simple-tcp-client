'use strict';

const net = require('net');

class Client {
    constructor(host, port) {
        this.host = host;
        this.port = port;
        this._socket = new net.Socket();
        this.messages = [];
        this.errors = [];
        this.heartbeats = [];

        this._socket.on('close', () => console.log('Connection closed'));
        this._socket.on('data', data => {
            console.log(`Client got: ${data}`);
            this._parseData(data);
        });
    }

    start(callback) {
        this._socket.connect(this.port, this.host, callback);
    }

    stop(callback) {
        this._socket.end();
        callback();
    }

    _send(data, callback){
        this._socket.write(data, callback)
    }

    _parseData(data){
        let parsedData;

        try {
            parsedData = JSON.parse(data);

            switch(parsedData.type){
                case 'error':
                    this.errors.push(parsedData);
                    break;
                case 'heartbeat':
                    let heartbeat = new Date();
                    this.heartbeats.push(heartbeat);
                    break;
                default:
                    console.log(`Unknown message type: ${parsedData.type}`, parsedData);
            }

        } catch (error) {
            console.log(`Unable to parse message from server: ${error}`);
        }
    }

}

module.exports = Client;
