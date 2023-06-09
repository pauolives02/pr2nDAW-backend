const Suggestion = require('../models/suggestion')
const SuggestionSubject = require('../models/suggestionSubject')

const controller = {
  // Suggestions
  allSuggestions: (req, res, next) => {
    const query = {}
    let populate = 'subject user_id'
    // filters
    if (req.query.description) query.description = { $regex: '.*' + req.query.description + '.*', $options: 'i' }
    if (req.query.status) query.status = req.query.status
    if (req.query.subject) query.subject = req.query.subject
    if (req.query.date) {
      const start = new Date(req.query.date)
      const end = new Date(req.query.date).setHours(23, 59, 59, 999)
      query.date = { $gte: start, $lte: end }
    }
    if (req.query.user_id) {
      populate = [
        {
          path: 'subject',
          model: 'suggestionSubject'
        }
      ]
      populate.push({ path: 'user_id', select: 'username', match: { username: { $regex: '.*' + req.query.user_id + '.*', $options: 'i' } } })
    }

    Suggestion.find(query).populate(populate).sort({ status: 1, date: -1 })
      .then(suggestions => {
        if (req.query.user_id) {
          suggestions = suggestions.filter(exercise => exercise.user_id != null)
        }
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

  changeStatus: (req, res, next) => {
    Suggestion.findByIdAndUpdate(req.params.id, { status: req.body.status })
      .then(result => {
        if (result) {
          res.status(200).json({ msg: 'Status changed successfully' })
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
    const query = { default: false }
    if (req.query.name) query.name = { $regex: '.*' + req.query.name + '.*', $options: 'i' }
    SuggestionSubject.find(query)
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
