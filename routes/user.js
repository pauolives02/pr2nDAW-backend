const express = require('express')
const userRoutes = require('../controllers/user')

const router = express.Router()

// ROUTES
router.post('/login', userRoutes.login)

module.exports = router
