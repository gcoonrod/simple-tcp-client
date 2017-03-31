'use strict';

const net = require('net');

class Client {
    constructor(host, port, options) {
        this.host = host;
        this.port = port;
        this._socket = new net.Socket();
        this.errors = [];
        this.lastHeartbeat = new Date();
        this.loggedIn = false;
        this.logger = options.logger || console;

        this._socket.on('close', () => this.logger.log('Connection closed'));
        this._socket.on('data', data => {
            //this.logger.log(`Client got: ${data}`);
            this._parseData(data);
        });
    }

    //TODO: Move this logic to the console application
    static _checkHeartbeat(client) {
        if (client.loggedIn) {
            const now = Date.now();
            const lastHeartbeat = client.lastHeartbeat.getTime();
            const timeSinceLastHeartbeat = now - lastHeartbeat;

            if (timeSinceLastHeartbeat >= 2) {
                this.logger.log(`${client.name} lost connection to server. Logging back in.`);
                client.login(client.name);
            }
        }
    }

    start(callback) {
        this._socket.connect(this.port, this.host, callback);
    }

    stop(callback) {
        this._socket.end();
        callback();
    }

    login(name, callback) {
        let login = {
            name: name
        };

        this._socket.write(JSON.stringify(login), () => {
            this.loggedIn = true;
            if(typeof callback === 'function'){
                callback();
            }
        });
    }

    _send(data, callback) {
        this._socket.write(JSON.stringify(data), callback)
    }

    requestTime(id, callback) {
        let request = {
            request: 'time',
            id: id
        };

        this._send(request, callback);
    }

    requestCount(id, callback) {
        let request = {
            request: 'count',
            id: id
        };

        this._send(request, callback);
    }

    parseResponse(response){
        if(response.count){
            this.logger.log(`Server has processed ${response.count} requests`, response);
        } else if(response.time){
            let time = new Date(response.time);
            this.logger.log(`Server reports time: ${time}`);
        } else {
            this.logger.log('Server has returned an unknown response!', response);
        }
    }

    _parseData(data) {
        let parsedData;

        try {
            parsedData = JSON.parse(data);

            switch (parsedData.type) {
                case 'error':
                    this.errors.push(parsedData);
                    break;
                case 'heartbeat':
                    this.lastHeartbeat = new Date();
                    break;
                case 'response':
                    this.parseResponse(parsedData);
                    break;
                default:
                    this.logger.log(`Unknown message type: ${parsedData.type}`, parsedData);
            }

        } catch (error) {
            this.logger.log(`Unable to parse message from server: ${error}`);
        }
    }

}

module.exports = Client;
