const mongoose = require("mongoose")

let isConnected = false

const connectDb = async (uri) => {
  if (!uri) {
    return false
  }
  try {
    await mongoose.connect(uri, { dbName: "ielts_writing" })
    isConnected = true
    return true
  } catch (error) {
    isConnected = false
    return false
  }
}

const getConnectionState = () => isConnected

module.exports = { connectDb, getConnectionState }

