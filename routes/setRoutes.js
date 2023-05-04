const express = require('express')
const setController = require('../controllers/setController')
const checkToken = require('../middlewares/checkToken')

const router = express.Router()

// ROUTES
router.get('/all', checkToken, setController.all)
router.get('/public', checkToken, setController.public)
router.get('/private', checkToken, setController.private)
router.get('/subscriptions', checkToken, setController.subscriptions)
router.get('/:id', checkToken, setController.getById)
// router.post('/add', checkToken, setController.add)
router.get('/get-image/:image', setController.getImage)

module.exports = router
