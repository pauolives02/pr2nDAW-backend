const express = require('express')
const userRoutes = require('../controllers/user')

const router = express.Router()

// ROUTES
router.post('/login', userRoutes.login)
router.post('/register', userRoutes.register)
router.get('/avatars', userRoutes.avatars)

module.exports = router
