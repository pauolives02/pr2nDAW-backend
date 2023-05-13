const express = require('express')
const suggestionController = require('../controllers/suggestionController')
const checkToken = require('../middlewares/checkToken')
const checkIsAdmin = require('../middlewares/checkIsAdmin')

const router = express.Router()

// ROUTES
router.get('/all', checkToken, checkIsAdmin, suggestionController.allSuggestions)
router.get('/user-suggestions', checkToken, suggestionController.userSuggestions)
router.post('/add-suggestion', checkToken, suggestionController.addSuggestion)
router.delete('/user-suggestions/delete/:id', checkToken, suggestionController.deleteUserSuggestion)
router.delete('/delete/:id', checkToken, checkIsAdmin, suggestionController.deleteSuggestion)

// Suggestion subjects
router.get('/suggestion-subjects', checkToken, suggestionController.getSubjects)
router.get('/suggestion-subjects-nd', checkToken, checkIsAdmin, suggestionController.getSubjectsND)
router.delete('/delete-subject/:id', checkToken, checkIsAdmin, suggestionController.deleteSubject)
router.post('/add-subject', checkToken, checkIsAdmin, suggestionController.addSuggestionSubject)
router.put('/update-subject/:id', checkToken, checkIsAdmin, suggestionController.updateSuggestionSubject)

module.exports = router
