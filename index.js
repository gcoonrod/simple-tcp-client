'use strict'
require('dotenv').config()

const Client = require('./lib/client')
const Util = require('./lib/util')
const vorpal = require('vorpal')()
const uuid = require('uuid')

const HOST = process.env.SERVER_HOST
const PORT = process.env.SERVER_PORT

let client
const id = uuid.v4()

function getClient (mode) {
  if (mode === 'development') {
    return new Client('127.0.0.1', PORT, {logger: vorpal})
  }

  return new Client(HOST, PORT, {logger: vorpal})
}

vorpal
  .command('connect')
  .description('Connects to Help.com Test Server')
  .action((args, callback) => {
    client = getClient(process.env.NODE_ENV)
    client.start(callback)
  })

vorpal
  .command('login <name>')
  .description('Logs in to Help.com Test Server with NAME')
  .action((args, callback) => {
    let name = args.name
    client.login(name, () => {
      vorpal.delimiter(`${name} >>`)
      setInterval(Util.checkHeartbeat, 2000, client)
      callback()
    })
  })

vorpal
  .command('get time')
  .description('Requests current time from Help.com Test Server')
  .action((args, callback) => {
    client.requestTime(id, callback)
  })

vorpal
  .command('get count')
  .description('Requests count from Help.com Test Server')
  .action((args, callback) => {
    client.requestCount(id, callback)
  })

vorpal
  .command('quit')
  .description('Disconnects from Help.com Test Server and exits application')
  .action(function (args) {
    const self = this
    args.options = args.options || {}
    args.options.sessionId = self.session.id
    client.stop(() => {
      self.parent.exit(args.options)
    })
  })

vorpal
  .command('send <json>')
  .description('Sends raw JSON to Help.com Test Server')
  .action(function (args, callback) {
    const self = this
    let request
    try {
      request = JSON.parse(args.json)
      client._send(request, callback)
    } catch (error) {
      self.log('Error parsing request string!', error)
      callback(error)
    }
  })

vorpal
  .delimiter('>>')
  .show()
