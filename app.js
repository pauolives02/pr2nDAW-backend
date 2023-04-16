const express = require('express')
const path = require('path')
const cors = require('cors')
const fileUpload = require('express-fileupload')

// ROUTES IMPORTS
const userRoutes = require('./routes/userRoutes')
const exerciseRoutes = require('./routes/exerciseRoutes')
const setRoutes = require('./routes/setRoutes')
const suggestionRoutes = require('./routes/suggestionRoutes')

// const checkToken = require('./middlewares/checkToken')
const handleErrors = require('./middlewares/handleErrors')
const notFound = require('./middlewares/notFound')

const app = express()

// CORS
app.use(cors())
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*')
//   res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method')
//   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
//   res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE')
//   next()
// })

// MIDDLEWARES
app.use(fileUpload())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use('/public', express.static(path.join(__dirname, 'assets')))

// ROUTES
app.use('/api/user', userRoutes)
app.use('/api/exercise', exerciseRoutes)
app.use('/api/set', setRoutes)
app.use('/api/suggestion', suggestionRoutes)

app.use(notFound)
app.use(handleErrors)

module.exports = app
