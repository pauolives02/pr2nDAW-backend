const express = require('express')
const subscriptionController = require('../controllers/subscriptionController')
const checkToken = require('../middlewares/checkToken')

const router = express.Router()

// ROUTES
router.get('/daily-goal', checkToken, subscriptionController.getDailyGoal)
router.get('/daily-goal/:id', checkToken, subscriptionController.getDailyGoalById)
router.put('/daily-goal/:id', checkToken, subscriptionController.updateDailyGoal)

module.exports = router
