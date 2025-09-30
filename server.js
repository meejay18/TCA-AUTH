const express = require('express')
require('./config/database')
const app = express()
const cors = require('cors')
app.use(cors('*'))
app.use(express.json())

const userRouter = require('./route/userRoute')
app.use(userRouter)

app.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Connection successfull backend is running',
  })
})

// app.listen(process.env.PORT, () => {
//   console.log(`Server running on port ${process.env.PORT}`)
// })
module.exports = app
