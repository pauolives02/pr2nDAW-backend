const express = require('express')
const suggestionController = require('../controllers/suggestionController')
const checkToken = require('../middlewares/checkToken')

const router = express.Router()

// ROUTES
// router.get('/all', checkToken, suggestionController.all)
router.get('/user-suggestions', checkToken, suggestionController.userSuggestions)
router.get('/suggestion-subjects', checkToken, suggestionController.getSubjects)
router.get('/suggestion-subjects-nd', checkToken, suggestionController.getSubjectsND)
router.post('/add-suggestion', checkToken, suggestionController.addSuggestion)

module.exports = router
