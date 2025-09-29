const mongoose = require('mongoose')
require('dotenv').config()
const DB = process.env.MONGO_URL

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database connected')
  })
  .catch((err) => {
    console.log(`Error connecting to database: ${err.message}`)
  })
