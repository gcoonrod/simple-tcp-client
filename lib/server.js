'use strict';

const net = require('net');

class Server {
    constructor(port) {
        this.registeredClients = {};
        this.port = port;
        this._server = net.createServer(socket => {
            console.log('Starting server');
            socket.on('data', data => {
                console.log(`Server Got: ${data}`);
                this.parseData(data, socket);
            });

            socket.on('end', () => console.log('Client disconnected'));
        });

        this._server.on('error', error => console.log);

        setInterval(Server._sendHeartbeats, 1000, this.registeredClients);
    }

    start(callback) {
        this._server.listen(this.port, callback);
    }

    stop(callback) {
        this._server.close(callback)
    }

    parseData(data, socket) {
        let parsedData;

        try {
            parsedData = JSON.parse(data);

            if (parsedData.name) {
                this.login(parsedData.name, socket)
            }

        } catch (error) {
            let errorJson = {
                type: 'error',
                error: error.toString()
            };

            socket.write(JSON.stringify(errorJson));
        }
    }

    login(name, socket) {
        console.log(`${name} has logged in`);
        socket.on('end', () => {
            delete this.registeredClients[name];
        });

        this.registeredClients[name] = new RegisteredClient(name, socket);
    }

    static _sendHeartbeats(clients) {
        const heartbeat = {
            type: 'heartbeat'
        };

        for (let name in clients) {
            clients[name].socket.write(JSON.stringify(heartbeat));
        }
    }

}

class RegisteredClient {
    constructor(name, socket) {
        this.name = name;
        this.socket = socket;

        this.socketName = socket.remoteAddress + ":" + socket.remotePort;
    }
}

module.exports = Server;
