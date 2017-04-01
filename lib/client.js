'use strict'

const net = require('net')

class Client {
  constructor (host, port, options) {
    this.host = host
    this.port = port
    this.name = null
    this._socket = new net.Socket()
    this.errors = []
    this.lastHeartbeat = new Date()
    this.loggedIn = false
    this.logger = (options && options.logger) || console

    this._socket.on('close', () => this.logger.log('Connection closed'))
    this._socket.on('data', data => {
      // this.logger.log(`Client got: ${data}`)
      this._parseData(data)
    })
  }

  toString () {
    let string = {
      host: this.host,
      port: this.port,
      name: this.name,
      loggedIn: this.loggedIn,
      lastHeartbeat: this.lastHeartbeat,
      errors: this.errors.length
    }
    return JSON.stringify(string)
  }

  isLoggedIn () {
    return this.loggedIn === true
  }

  start (callback) {
    this._socket.connect(this.port, this.host, callback)
  }

  stop (callback) {
    this._socket.end()
    callback()
  }

  login (name, callback) {
    let login = {
      name: name
    }
    this.name = name

    this._send(login, () => {
      this.loggedIn = true
      if (typeof callback === 'function') {
        callback()
      }
    })
  }

  _send (data, callback) {
    let request = JSON.stringify(data)
    request = request + '\n'
    this._socket.write(request, callback)
  }

  requestTime (id, callback) {
    let request = {
      request: 'time',
      id: id
    }

    this._send(request, callback)
  }

  requestCount (id, callback) {
    let request = {
      request: 'count',
      id: id
    }

    this._send(request, callback)
  }

  parseMessage (message) {
    if (message.msg) {
      const msg = message.msg
      if (msg.time) {
        let message = `Server Reports Time: ${msg.time}`
        if (msg.random && msg.random >= 30) {
          message = message + `.\n Random Value ${msg.random} is greater than or equal 30.`
        }
        this.logger.log(message)
      } else if (msg.count) {
        this.logger.log(`Server Reports Count: ${msg.count}`)
      } else {
        this.logger.log('Server has returned an unknown message!', message)
      }
    } else {
      this.logger.log('Server has returned an unknown message!', message)
    }
  }

  parseError (error) {
    const parsedError = new ErrorResponse(error)
    this.logger.log(`Server responded with an error: ${parsedError.result}`)
    this.errors.push(parsedError)
  }

  _parseData (data) {
    data = data.toString()
    let parts = data.split('\n')
    return parts.forEach(part => {
      if (part) {
        this._parseResponse(part)
      }
    })
  }

  _parseResponse (response) {
    let parsedResponse
    try {
      parsedResponse = JSON.parse(response)

      switch (parsedResponse.type) {
        case 'error':
          this.parseError(parsedResponse)
          break
        case 'heartbeat':
          this.lastHeartbeat = Date.now() / 1000
          break
        case 'msg':
          this.parseMessage(parsedResponse)
          break
        case 'welcome':
          this.loggedIn = true
          this.logger.log(`Login successful. Server responded: ${parsedResponse.msg}`)
          break
        default:
          this.logger.log(`Unknown message type: ${parsedResponse.type}`, parsedResponse)
      }
    } catch (error) {
      this.logger.log(`Unable to parse message from server: ${error}`)
    }
  }
}

class ErrorResponse {
  constructor (error) {
    this.reason = error.reason
    this.type = error.type
    this.result = error.result
  }
}

module.exports = Client
