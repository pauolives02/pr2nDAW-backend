// const User = require('../models/user')
const UserStat = require('../models/userStat')

const controller = {
  getTopLevel: (req, res, next) => {
    UserStat.find({}).limit(10).sort({ level: -1, current_xp: -1 }).populate('user_id', 'username avatar')
      .then(usersStats => {
        return res.status(200).json(usersStats)
      })
      .catch(err => next(err))
  },

  getTopExercises: (req, res, next) => {
    UserStat.find({}).limit(10).sort({ exercises_completed: -1 }).populate('user_id', 'username avatar')
      .then(usersStats => {
        return res.status(200).json(usersStats)
      })
      .catch(err => next(err))
  }
}

module.exports = controller
