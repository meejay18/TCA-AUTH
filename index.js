const app = require('./server')
const PORT = process.env.PORT || 7000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
