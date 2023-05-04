const mongoose = require('mongoose')
const app = require('./app')
require('dotenv').config()

const connectionString = process.env.MONGODB_URI
const port = process.env.PORT

// Connexió MongoDB
mongoose.Promise = global.Promise
mongoose.set('strictQuery', false)
mongoose.connect(connectionString)
  .then(() => {
    console.log('MongoDB Connected')
    app.listen(port, () => {
      console.log(`Server started on http://localhost:${port}`)
    })
  })
  .catch(err => console.log(err))

// Controlar excepcio i tancar connexió amb MongoDB
process.on('uncaughtException', err => {
  console.log(err)
  mongoose.disconnect()
})
