const express = require('express')
const exerciseRoutes = require('../controllers/exercise')
const checkToken = require('../middlewares/checkToken')

const router = express.Router()

// ROUTES
router.get('/all', checkToken, exerciseRoutes.all)
router.get('/public', checkToken, exerciseRoutes.public)
router.get('/private', checkToken, exerciseRoutes.private)
router.get('/:id', checkToken, exerciseRoutes.getById)
router.post('/add', checkToken, exerciseRoutes.add)
router.get('/get-image/:image', exerciseRoutes.getImage)

module.exports = router
