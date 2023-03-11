const express = require('express')
const userRoutes = require('./routes/user')

const notFound = require('./middlewares/notFound')

const app = express()

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE')
  next()
})

// MIDDLEWARES
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// ROUTES
app.use('/api/user', userRoutes)
app.use(notFound)

module.exports = app
