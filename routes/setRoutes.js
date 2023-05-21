const express = require('express')
const setController = require('../controllers/setController')
const checkToken = require('../middlewares/checkToken')
const checkIsAdmin = require('../middlewares/checkIsAdmin')

const router = express.Router()

// ROUTES
router.get('/all', checkToken, checkIsAdmin, setController.all)
router.get('/public', checkToken, setController.public)
router.get('/private', checkToken, setController.private)
router.get('/subscriptions', checkToken, setController.subscriptions)
router.get('/:id', checkToken, setController.getById)
router.post('/add', checkToken, setController.add)
router.delete('/delete/:id', checkToken, setController.delete)
router.get('/get-image/:image', setController.getImage)
router.post('/subscription/add', checkToken, setController.addSubscription)
router.post('/subscription/remove', checkToken, setController.removeSubscription)

module.exports = router
