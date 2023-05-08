const express = require('express')
const userController = require('../controllers/userController')

const checkToken = require('../middlewares/checkToken')
const checkIsAdmin = require('../middlewares/checkIsAdmin')

const router = express.Router()

// ROUTES
router.post('/login', userController.login)
router.post('/register', userController.register)
router.get('/user-data', checkToken, userController.getAuthUser)
router.get('/user-stats', checkToken, userController.getUserStats)
router.get('/get-all', checkToken, checkIsAdmin, userController.getAllUsers)
// router.get('/avatars', userController.avatars)

module.exports = router
