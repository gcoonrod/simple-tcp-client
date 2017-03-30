'use strict';

const chai = require('chai');
const expect = chai.expect;

const Server = require('../lib/server');

describe('Testing Server', function(){
    before(function(done){
        Server.start(() => {
            console.log('Server started');
            done();
        });
    });

    after(function(done){
        Server.stop(error => {
            console.log('Server stopped');
            done(error);
        });
    });

    it('is alive', function(done){
        console.log('Whee')
        done();
    });
});
