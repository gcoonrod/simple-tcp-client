'use strict'

const net = require('net')
const uuid = require('uuid')

class Server {
  constructor (port) {
    this.registeredClients = {}
    this.port = port
    this.requests = 0
    this._server = net.createServer(socket => {
      socket.on('data', data => {
        this.requests++
        this.parseData(data, socket)
      })
    })

// eslint-disable-next-line handle-callback-err
    this._server.on('error', error => console.log)

    setInterval(Server._sendHeartbeats, 1000, this.registeredClients)
  }

  static _sendHeartbeats (clients) {
    const heartbeat = {
      type: 'heartbeat',
      epoch: Date.now() / 1000
    }

    for (let _id in clients) {
      clients[_id].socket.write(JSON.stringify(heartbeat))
    }
  }

  start (callback) {
    this._server.listen(this.port, callback)
  }

  stop (callback) {
    this._server.close(callback)
  }

  parseData (data, socket) {
    let parsedData

    try {
      parsedData = JSON.parse(data)

      if (parsedData.name) {
        return this.login(parsedData.name, socket)
      }

      if (parsedData.request) {
        if (parsedData.request === 'count') {
          return this.getCount(socket, parsedData.id)
        } else if (parsedData.request === 'time') {
          return this.getTime(socket, parsedData.id)
        }
      }
    } catch (error) {
      let errorJson = {
        type: 'error',
        error: error.toString()
      }

      socket.write(JSON.stringify(errorJson))
    }
  }

  login (name, socket) {
    let newClient = new RegisteredClient(name, socket)

    this.registeredClients[newClient._id] = newClient

    let welcome = {
      type: 'welcome',
      msg: `Welcome ${name}`
    }

    socket.write(JSON.stringify(welcome))

    socket.on('end', () => {
      delete this.registeredClients[newClient._id]
    })
  }

  getCount (socket, id) {
    let response = {
      type: 'msg',
      msg: {
        count: this.requests,
        reply: id
      }
    }

    socket.write(JSON.stringify(response))
  }

  getTime (socket, id) {
    let response = {
      type: 'msg',
      msg: {
        time: new Date().toDateString(),
        random: Math.floor(Math.random() * (10000 - 1)) + 1,
        reply: id
      },
      sender: 'worker'
    }

    socket.write(JSON.stringify(response))
  }
}

class RegisteredClient {
  constructor (name, socket) {
    this._id = uuid.v4()
    this.name = name
    this.socket = socket

    this.socketName = socket.remoteAddress + ':' + socket.remotePort
  }
}

module.exports = Server
