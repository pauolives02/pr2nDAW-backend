const Suggestion = require('../models/suggestion')

const controller = {
  userSuggestions: (req, res, next) => {
    Suggestion.find({ user_id: req.userId })
      .then(suggestions => {
        return res.status(200).json(suggestions)
      })
      .catch(err => {
        next(err)
      })
  }

}

module.exports = controller
