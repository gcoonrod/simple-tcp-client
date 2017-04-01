'use strict'

function checkHeartbeat (client) {
  if (client.isLoggedIn()) {
    const now = Date.now() / 1000
    const lastHeartbeat = client.lastHeartbeat
    const timeSinceLastHeartbeat = lastHeartbeat - now
    if (timeSinceLastHeartbeat >= 2) {
      client.logger.log(`${client.name} lost connection to server. Logging back in.`)
      client.login(client.name)
    }
  }
}

module.exports = {
  checkHeartbeat: checkHeartbeat
}
