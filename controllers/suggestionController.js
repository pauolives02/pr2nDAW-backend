const Suggestion = require('../models/suggestion')
const SuggestionSubject = require('../models/suggestionSubject')

const controller = {

  allSuggestions: (req, res, next) => {
    Suggestion.find({}).populate('subject')
      .then(suggestions => {
        return res.status(200).json(suggestions)
      })
      .catch(err => {
        next(err)
      })
  },

  userSuggestions: (req, res, next) => {
    Suggestion.find({ user_id: req.userId }).populate('subject')
      .then(suggestions => {
        return res.status(200).json(suggestions)
      })
      .catch(err => {
        next(err)
      })
  },

  getSubjects: (req, res, next) => {
    SuggestionSubject.find({})
      .then(subjects => {
        return res.status(200).json(subjects)
      })
      .catch(err => {
        next(err)
      })
  },

  getSubjectsND: (req, res, next) => {
    SuggestionSubject.find({ default: false })
      .then(subjects => {
        return res.status(200).json(subjects)
      })
      .catch(err => {
        next(err)
      })
  },

  deleteSubject: function (req, res, next) {
    const id = req.params.id
    SuggestionSubject.findByIdAndRemove(id)
      .then(item => {
        if (item) {
          item = { ...item, status: 'deleted' }
          res.json(item)
        } else {
          res.status(404).json({ error: 'Not found' })
        }
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
        return res.status(200).json(result)
      })
      .catch(err => {
        next(err)
      })
  }

}

module.exports = controller
