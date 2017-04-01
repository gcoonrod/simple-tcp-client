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
    this.lastRequestCount = 0
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

  parseMessage (response) {
    const messageResponse = new MessageResponse(response)
    if (messageResponse.message.count) {
      // Only exists for testing
      this.lastRequestCount = messageResponse.message.count
    }
    this.logger.log(messageResponse.toString())
  }

  parseWelcome (response) {
    const welcomeResponse = new WelcomeResponse(response)
    this.loggedIn = true
    this.logger.log(welcomeResponse.toString())
  }

  parseHeartbeat (response) {
// eslint-disable-next-line no-unused-vars
    const heartbeatResponse = new HeartbeatResponse(response)
    this.lastHeartbeat = Date.now() / 1000
  }

  parseError (error) {
    const parsedError = new ErrorResponse(error)
    this.logger.log(`Server responded with an error: ${parsedError.result}`)
    this.errors.push(parsedError)
  }

  parseUnknownResponse (response) {
    const unknownResponse = new UnknownResponse(response)
    this.logger.log(`Unknown response type: ${unknownResponse.type}`, unknownResponse)
  }

  parseInvalidResponse (error, response) {
    const invalidResponse = new InvalidResponse(error, response)
    this.logger.log(`Server send unparsable response!\n ${invalidResponse}`)
  }

  _parseData (data) {
    data = data.toString()
    let parts = data.split('\n')
    return parts.forEach(part => {
      if (part) {
        this._parseDatum(part)
      }
    })
  }

  _parseDatum (response) {
    let parsedResponse
    try {
      parsedResponse = JSON.parse(response)

      switch (parsedResponse.type) {
        case 'error':
          this.parseError(parsedResponse)
          break
        case 'heartbeat':
          this.parseHeartbeat(parsedResponse)
          break
        case 'msg':
          this.parseMessage(parsedResponse)
          break
        case 'welcome':
          this.parseWelcome(parsedResponse)
          break
        default:
          this.parseUnknownResponse(parsedResponse)
      }
    } catch (error) {
      this.parseInvalidResponse(error, response)
    }
  }
}

class HeartbeatResponse {
  constructor (response) {
    this.epoch = response.epoch
  }
}

class WelcomeResponse {
  constructor (response) {
    this.message = response.msg
  }

  toString () {
    return `Login successful. Server responded: ${this.message}`
  }
}

class ErrorResponse {
  constructor (response) {
    this.reason = response.reason
    this.type = response.type
    this.result = response.result
  }
}

class MessageResponse {
  constructor (response) {
    this.type = response.type
    this.message = response.msg
  }

  toString () {
    if (this.message.time) {
      let string = `Server Reports Time: ${this.message.time}`
      if (this.message.random && this.message.random >= 30) {
        string = string + `.\n Random Value ${this.message.random} is greater than or equal 30.`
      }
      return string
    } else if (this.message.count) {
      return `Server Reports Count: ${this.message.count}`
    } else {
      return JSON.stringify(this.message)
    }
  }
}

class UnknownResponse {
  constructor (response) {
    this.type = response.type
    this.response = response
  }
}

class InvalidResponse {
  constructor (error, response) {
    this.response = response
    this.error = error
  }

  toString () {
    return `Response: ${this.response}\n Error: ${this.error}`
  }
}

module.exports = Client
