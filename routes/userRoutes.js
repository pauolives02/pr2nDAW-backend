const express = require('express')
const userRoutes = require('../controllers/user')

const checkToken = require('../middlewares/checkToken')

const router = express.Router()

// ROUTES
router.post('/login', userRoutes.login)
router.post('/register', userRoutes.register)
router.get('/user-data', checkToken, userRoutes.getAuthUser)
router.get('/avatars', userRoutes.avatars)

module.exports = router
