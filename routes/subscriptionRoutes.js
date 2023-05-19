const express = require('express')
const subscriptionController = require('../controllers/subscriptionController')
const checkToken = require('../middlewares/checkToken')

const router = express.Router()

// ROUTES
router.get('/daily-goal', checkToken, subscriptionController.getDailyGoal)

module.exports = router
