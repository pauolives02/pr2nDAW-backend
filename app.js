const express = require('express')
const path = require('path')
const userRoutes = require('./routes/userRoutes')

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
app.use('/public', express.static(path.join(__dirname, 'assets')))

// ROUTES
app.use('/api/user', userRoutes)

// app.use('/public', express.static(path.join(__dirname, 'assets')))
app.use(notFound)

module.exports = app
