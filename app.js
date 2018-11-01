const express = require('express')
const path = require('path')
const webSocket = require('ws')
const WS_PORT = 1234
const HTTP_PORT = 8080

const users = []
const messages = []

const app = express()
const webSocketServer = new webSocket.Server({ port: WS_PORT })

app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'index.html')) )

app.listen(HTTP_PORT, () => console.log(`Http listening on port ${HTTP_PORT}`))

webSocketServer.on('connection', (ws) => {
  ws.send(JSON.stringify({
    type: 'init',
    messagesCollection: messages
  }))

  const messageHandlers = {
    'auth': ({ id }) => {
      if (!id) {
        const newId = `${(new Date()).getTime()}-${process.pid}`
        
        users.push(newId)

        const resPayload = {
          type: 'auth',
          id: newId
        }

        return ws.send(JSON.stringify(resPayload))
      }

      ws.send(JSON.stringify({type: 'auth', id: null}))
    },

    'message': ({ id, messageText }) => {
      messages.push({
        id,
        messageText
      })

      ws.send(JSON.stringify({
        type: 'message',
        id,
        messageText
      }))
    }
  }

  ws.on('message', (data) => {
    const payload = JSON.parse(data)
    console.log(payload)

    messageHandlers[payload.type](payload)
  })
})