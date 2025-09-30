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

// const connectDB = async () => {
//   try {
//     await mongoose.connect(DB, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//     console.log('MongoDB connected successfully')
//   } catch (error) {
//     console.error('MongoDB connection failed:', error.message)
//     process.exit(1)
//   }
// }

// connectDB()
