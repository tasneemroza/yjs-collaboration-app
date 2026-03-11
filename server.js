import express from "express"
import expressWs from "express-ws"
import { Server } from "@hocuspocus/server"
import { Database } from "@hocuspocus/extension-database"
import pg from "pg"

const { Pool } = pg

const port = process.env.PORT || 3000
const roomPass = process.env.ROOM_PASSWORD || "xamk123"

const database = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

const hocusServer = Server.configure({
  extensions: [
    new Database({
      fetch: async ({ documentName }) => {
        const data = await database.query(
          "SELECT data FROM documents WHERE name=$1",
          [documentName]
        )
        if (data.rows.length > 0) {
          return data.rows[0].data
        }
        return null
      },

      store: async ({ documentName, state }) => {
        await database.query(
          `
          INSERT INTO documents (name, data)
          VALUES ($1,$2)
          ON CONFLICT (name)
          DO UPDATE SET data=$2
          `,
          [documentName, state]
        )
      }
    })
  ],

  async onAuthenticate({ token }) {
    const parts = token.split("::")
    const user = parts[0]
    const pass = parts[1]

    if (pass !== roomPass) {
      throw new Error("Access denied")
    }

    return { username: user }
  }
})

const app = express()
expressWs(app)

app.use(express.static("public"))

app.ws("/collaboration", (socket, request) => {
  hocusServer.handleConnection(socket, request)
})

app.listen(port, () => {
  console.log(`App running on port ${port}`)
})