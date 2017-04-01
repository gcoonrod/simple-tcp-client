/* eslint-disable no-undef,no-unused-expressions */
'use strict'
require('mocha')

const chai = require('chai')
const expect = chai.expect

const Server = require('../lib/server')
const Client = require('../lib/client')

let server, client

describe('Tests', function () {
  beforeEach(function (done) {
    server = new Server(8192)
    server.start(() => {
      console.log('Server started')
      done()
    })
  })

  afterEach(function (done) {
    server.stop(error => {
      console.log('Server stopped')
      done(error)
    })
  })

  describe('Server Tests', function () {
    beforeEach(function (done) {
      client = new Client('127.0.0.1', 8192)
      client.start(done)
    })

    afterEach(function (done) {
      client.stop(done)
    })

    it('should accept a valid login', function (done) {
      client.login('test1', () => {
        setTimeout(() => {
          expect(client.isLoggedIn()).to.be.true
          done()
        }, 2100)
      })
    })

    it('should respond with an error when sent invalid json', function (done) {
      let badJson = '{"foo": "bar"]'

      client.login('test2', () => {
        client._socket.write(badJson, () => {
          setTimeout(() => {
            expect(client.errors.length).to.be.equal(1)
            done()
          }, 2600)
        })
      })
    })

    it('should get a count of requests', function (done) {
      client.login('test3', () => {
        setTimeout(() => {
          client.requestCount('test3', () => {
            setTimeout(() => {
              expect(client.lastRequestCount).to.equal(2)
              done()
            }, 2300)
          })
        }, 2100)
      })
    })

    it('should get the time', function (done) {
      client.login('test4', () => {
        setTimeout(() => {
          client.requestTime('test4', () => {
            done()
          })
        }, 2400)
      })
    })
  })
})
