const express = require('express')
const avatarController = require('../controllers/avatarController')
const checkToken = require('../middlewares/checkToken')
const checkIsAdmin = require('../middlewares/checkIsAdmin')

const router = express.Router()

// ROUTES
router.get('/all', checkToken, avatarController.getAll)
router.get('/get-avatar/:avatar', avatarController.getAvatar)
router.post('/add', checkToken, avatarController.uploadAvatar)
router.delete('/delete/:id', checkToken, checkIsAdmin, avatarController.deleteAvatar)

module.exports = router
