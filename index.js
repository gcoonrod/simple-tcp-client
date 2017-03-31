'use strict';
const Client = require('./lib/client');
const vorpal = require('vorpal')();

const client = new Client('35.184.58.167', 9432, {logger: vorpal});

vorpal
    .command('connect', 'connect')
    .action((args, callback) => {
        client.start(callback)
    });

vorpal
    .command('login <name>', 'Login')
    .action((args, callback) => {
        let name = args.name;
        client.login(name, callback);
    });

vorpal
    .command('quit', 'quit')
    .action(function(args) {
        const self = this;
        args.options = args.options || {};
        args.options.sessionId = self.session.id;
        client.stop(() => {
            self.parent.exit(args.options)
        });
    });

vorpal
    .delimiter('>>')
    .show();
