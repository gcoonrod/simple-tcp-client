# simple-tcp-server
Coding Challenge

## Reasoning
The following application is broken into three parts. As per the requirements of this challenge, only `index.js` and `./lib/client.js` are relevant to interacting with the test server.

#### `index.js`
In general, I avoided using public NPM modules to achieve the requirements of the challenge. However, for the `cli` interface I felt that it was a valuable trade-off to use [Vorpal](http://vorpal.js.org) instead of developing a `cli` interface from scratch. The objectives of the challenge made it clear that the Client and its interaction with the test server were the most central aspects of this test. In addition, I do believe that in real world engineering it is often much better to 'buy' instead of build. If a problem has been solved by others and their solution meets my needs and doesn't violate any copyright then it is often better to use that solution.

#### `./lib/client.js`
While Javascript remains a prototypical inheritance language. I find that the use of the more recent `class` based syntax provides a significant improvement in readability. As code is read far more often than it is written, I believe that engineers should strive for simplicity and readability over elegance and compactness. In addition, I avoided the use of Promises, Generators, and any `async` or `await` features available in the latest versions of Node. This was done primarily because my conversations with your engineers thus far made it clear that the tried and true use of `callbacks` was preferred.

#### `./lib/server.js`
I personally prefer a more TDD approach and so used the Documentation and Acceptance Criteria to develop a mock implementation of the test server (`./lib/server.js`). The mock server allowed me to minimize the amount of time spent bit banging the test server and provided a platform to write realistic tests.

### Setup
Prior to use you must create a `.env` file in the root folder which contains the host and port information for the server.
```
SERVER_HOST='YOUR_IP'
SERVER_PORT=YOUR_PORT
```

Install the npm modules
```
> npm install
```

### Usage
`index.js` provides a simple `cli` for interacting with the Client and Server.
```
> node index.js
>>
```

You will be dropped into a prompt denoted by `>>`. At this prompt you can enter a few commands.
```
>> help

  Commands:

    help [command...]  Provides help for a given command.
    exit               Exits application.
    connect            Connects to Test Server
    login <name>       Logs in to Test Server with NAME
    get time           Requests current time from  Test Server
    get count          Requests count from Test Server
    quit               Disconnects from Test Server and exits application
    send <json>        Sends raw JSON to Test Server
```

Commands followed by a term in angle brackets denotes required parameters. For example, when logging in you must enter the login command as such:
```
>> login Bob
```

To which the Server should respond:
```
>> login Bob
Login successful. Server responded: Welcome ~~ Bob!
Bob >>
```

_Important Note:_
You can not enter any commands other than `help` or `quit` before using `connect`
