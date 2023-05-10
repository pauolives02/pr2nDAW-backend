const express = require('express')
const suggestionController = require('../controllers/suggestionController')
const checkToken = require('../middlewares/checkToken')
const checkIsAdmin = require('../middlewares/checkIsAdmin')

const router = express.Router()

// ROUTES
router.get('/all', checkToken, checkIsAdmin, suggestionController.allSuggestions)
router.get('/user-suggestions', checkToken, suggestionController.userSuggestions)
router.post('/add-suggestion', checkToken, suggestionController.addSuggestion)

// Suggestion subjects
router.get('/suggestion-subjects', checkToken, suggestionController.getSubjects)
router.get('/suggestion-subjects-nd', checkToken, checkIsAdmin, suggestionController.getSubjectsND)
router.delete('/delete-subject/:id', checkToken, checkIsAdmin, suggestionController.deleteSubject)

module.exports = router
