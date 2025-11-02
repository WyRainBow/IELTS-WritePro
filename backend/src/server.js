require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { connectDb } = require("./db")
const questionRoutes = require("./routes/questions")
const submissionRoutes = require("./routes/submissions")

const app = express()

app.use(cors())
app.use(express.json({ limit: "1mb" }))

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

app.use("/api/questions", questionRoutes)
app.use("/api/submissions", submissionRoutes)

const port = process.env.PORT || 4000
const mongoUri = process.env.MONGODB_URI || ""

const bootstrap = async () => {
  const connected = await connectDb(mongoUri)
  app.locals.mongoReady = connected
  if (!connected) {
    console.warn("mongo connection unavailable, using file storage")
  }
  app.listen(port, () => {
    console.log(`server started on ${port}`)
  })
}

bootstrap()

