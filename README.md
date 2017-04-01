# help-challenge
Help.com Coding Challenge

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
    connect            Connects to Help.com Test Server
    login <name>       Logs in to Help.com Test Server with NAME
    get time           Requests current time from Help.com Test Server
    get count          Requests count from Help.com Test Server
    quit               Disconnects from Help.com Test Server and exits application
    send <json>        Sends raw JSON to Help.com Test Server
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
