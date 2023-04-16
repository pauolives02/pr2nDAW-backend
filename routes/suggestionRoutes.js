const express = require('express')
const suggestionController = require('../controllers/suggestionController')
const checkToken = require('../middlewares/checkToken')

const router = express.Router()

// ROUTES
// router.get('/all', checkToken, suggestionController.all)
router.get('/user-suggestions', checkToken, suggestionController.userSuggestions)

module.exports = router
