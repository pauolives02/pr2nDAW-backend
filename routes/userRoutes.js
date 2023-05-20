const express = require('express')
const userController = require('../controllers/userController')

const checkToken = require('../middlewares/checkToken')
const checkIsAdmin = require('../middlewares/checkIsAdmin')

const router = express.Router()

// ROUTES
router.post('/login', userController.login)
router.post('/register', userController.register)
router.get('/user-data', checkToken, userController.getAuthUser)
router.get('/user-profile/:userid', checkToken, userController.getUserProfile)
router.get('/user-stats/:userid?', checkToken, userController.getUserStats)
router.get('/get-all', checkToken, checkIsAdmin, userController.getAllUsers)
router.put('/update-password', checkToken, userController.updateUserPassword)
router.put('/update-data', checkToken, userController.updateUserData)
router.put('/update-avatar', checkToken, userController.updateUserAvatar)

module.exports = router
