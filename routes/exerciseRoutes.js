const express = require('express')
const exerciseController = require('../controllers/exerciseController')
const checkToken = require('../middlewares/checkToken')

const router = express.Router()

// ROUTES
router.get('/all', checkToken, exerciseController.all)
router.get('/public', checkToken, exerciseController.public)
router.get('/private', checkToken, exerciseController.private)
router.get('/subscriptions', checkToken, exerciseController.subscriptions)
router.get('/:id', checkToken, exerciseController.getById)
router.post('/add', checkToken, exerciseController.add)
router.delete('/delete/:id', checkToken, exerciseController.delete)
router.put('/update/:id', checkToken, exerciseController.update)
router.get('/get-image/:image', exerciseController.getImage)
router.post('/subscription/add', checkToken, exerciseController.addSubscription)
router.post('/subscription/remove', checkToken, exerciseController.removeSubscription)

module.exports = router
