import express from "express"
import { Server } from "@hocuspocus/server"

const WEB_PORT = 3000
const WS_PORT = 1240

const app = express()

// serve client files
app.use(express.static("client"))

app.listen(WEB_PORT, () => {
  console.log(`Web interface running at http://localhost:${WEB_PORT}`)
})

// create websocket server for collaboration
const collabServer = new Server({
  port: WS_PORT,
})

collabServer.listen()

console.log(`Collaboration server active at ws://localhost:${WS_PORT}`)