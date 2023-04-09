const express = require('express')
const exerciseRoutes = require('../controllers/exercise')

const router = express.Router()

// ROUTES
router.get('/all', exerciseRoutes.all)
router.get('/public', exerciseRoutes.public)
router.get('/private', exerciseRoutes.private)
router.post('/add', exerciseRoutes.add)

module.exports = router
