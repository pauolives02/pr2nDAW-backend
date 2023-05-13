const Suggestion = require('../models/suggestion')
const SuggestionSubject = require('../models/suggestionSubject')

const controller = {
  // Suggestions
  allSuggestions: (req, res, next) => {
    Suggestion.find({}).populate('subject user_id').sort({ status: 1, date: -1 })
      .then(suggestions => {
        return res.status(200).json(suggestions)
      })
      .catch(err => next(err))
  },

  userSuggestions: (req, res, next) => {
    Suggestion.find({ user_id: req.userId }).populate('subject').sort({ status: 1, date: -1 })
      .then(suggestions => {
        return res.status(200).json(suggestions)
      })
      .catch(err => next(err))
  },

  addSuggestion: (req, res, next) => {
    const suggestion = new Suggestion({
      subject: req.body.subject,
      description: req.body.description,
      user_id: req.userId,
      date: new Date()
    })

    suggestion.save()
      .then(result => {
        return res.status(200).json({ msg: 'Suggestion sent successfully' })
      })
      .catch(err => next(err))
  },

  deleteUserSuggestion: (req, res, next) => {
    Suggestion.findOneAndRemove({ _id: req.params.id, user_id: req.userId })
      .then(suggestion => {
        if (suggestion) {
          suggestion = { ...suggestion, msg: 'Suggestion deleted successfully' }
          res.json(suggestion)
        } else {
          res.status(404).json({ error: 'Not found' })
        }
      })
      .catch(err => next(err))
  },

  deleteSuggestion: (req, res, next) => {
    Suggestion.findByIdAndRemove(req.params.id)
      .then(suggestion => {
        if (suggestion) {
          suggestion = { ...suggestion, msg: 'Suggestion deleted successfully' }
          res.json(suggestion)
        } else {
          res.status(404).json({ error: 'Not found' })
        }
      })
      .catch(err => next(err))
  },

  // Suggestions subjects
  getSubjects: (req, res, next) => {
    SuggestionSubject.find({})
      .then(subjects => {
        return res.status(200).json(subjects)
      })
      .catch(err => next(err))
  },

  getSubjectsND: (req, res, next) => {
    SuggestionSubject.find({ default: false })
      .then(subjects => {
        return res.status(200).json(subjects)
      })
      .catch(err => next(err))
  },

  deleteSubject: function (req, res, next) {
    const id = req.params.id
    SuggestionSubject.findByIdAndRemove(id)
      .then(item => {
        if (item) {
          item = { ...item, msg: 'Subject deleted successfully' }
          res.json(item)
        } else {
          res.status(404).json({ error: 'Not found' })
        }
      })
      .catch(err => next(err))
  },

  addSuggestionSubject: (req, res, next) => {
    const suggestionSubject = new SuggestionSubject({
      name: req.body.name
    })

    suggestionSubject.save()
      .then(result => {
        res.status(201).json({
          msg: 'Subject added successfully',
          subject: result
        })
      })
      .catch(err => next(err))
  },

  updateSuggestionSubject: (req, res, next) => {
    SuggestionSubject.findByIdAndUpdate(req.params.id, { name: req.body.name })
      .then(result => {
        if (result) {
          res.status(200).json({ msg: 'Subject updated successfully' })
        } else {
          res.status(404).json({ error: 'Subject not found' })
        }
      })
      .catch(err => next(err))
  }

}

module.exports = controller
