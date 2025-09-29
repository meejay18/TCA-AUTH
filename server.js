const express = require('express')
require('./config/database')
const app = express()
app.use(express.json())
const PORT = process.env.PORT || 7000

const userRouter = require('./route/userRoute')
app.use(userRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
