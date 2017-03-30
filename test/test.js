'use strict';

const chai = require('chai');
const expect = chai.expect;

const Server = require('../lib/server');
const Client = require('../lib/client');

let server, client;

describe('Tests', function() {
    before(function(done) {
        server = new Server(8192);
        server.start(() => {
            console.log('Server started');
            done();
        });
    });

    after(function(done) {
        server.stop(error => {
            console.log('Server stopped');
            done(error);
        });
    });

    it('is alive', function(done) {
        client = new Client('127.0.0.1', 8192);
        client.start(() => {
            console.log('whee');
            client.stop(() => {
                done();
            });
        });
    });

    describe('Server Tests', function() {

        beforeEach(function(done) {
            client = new Client('127.0.0.1', 8192);
            client.start(done)
        });

        afterEach(function(done) {
            client.stop(done);
        });

        it('should accept a valid login', function(done) {
            let login = {
                name: 'Bob'
            };

            client._send(JSON.stringify(login), () => {
                setTimeout(() => {
                    expect(client.heartbeats.length).to.be.within(3, 5);
                    done();
                }, 5000);
            });
        });

        it('should respond with an error when sent invalid json', function(done) {
            let badJson = '{"foo": "bar"]';

            client._send(badJson, () => {
                setTimeout(() => {
                    expect(client.errors.length).to.be.equal(1);
                    done();
                }, 5000);
            });
        });
    });
});
