const express = require('express')
const rankingController = require('../controllers/rankingController')
const checkToken = require('../middlewares/checkToken')

const router = express.Router()

// ROUTES
router.get('/lvl', checkToken, rankingController.getTopLevel)
router.get('/exercises', checkToken, rankingController.getTopExercises)

module.exports = router
