require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const UserStat = require('../models/userStat')
const Avatar = require('../models/avatar')

const nextLvlXP = require('../helpers/nextLvlXP')

const controller = {
  login: (req, res, next) => {
    let fetchedUser
    User.findOne({ $or: [{ email: req.body.username }, { username: req.body.username }] })
      .then(user => {
        if (!user) return false

        fetchedUser = user
        return bcrypt.compare(req.body.password, user.password)
      })
      .then(result => {
        if (!result) return res.status(401).json({ msg: 'Auth failed' })

        // Crear un nou token
        const token = jwt.sign(
          {
            userId: fetchedUser._id,
            isAdmin: fetchedUser.isAdmin
          },
          process.env.SECRET,
          { expiresIn: '1h' }
        )
        return res.status(200).json({ token, expiresIn: 3600 })
      })
      .catch(err => next(err))
  },

  register: (req, res, next) => {
    bcrypt.hash(req.body.password, 10).then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash,
        username: req.body.username,
        isAdmin: false
      })
      user.save()
        .then(result => {
          const userStat = new UserStat({ user_id: result._id })
          userStat.save()

          // Crear un nou token
          const token = jwt.sign(
            {
              userId: result._id,
              isAdmin: result.isAdmin
            },
            process.env.SECRET,
            { expiresIn: '1h' }
          )
          return res.status(200).json({ token, expiresIn: 3600 })
        })
        .catch(err => {
          if (err.name === 'ValidationError') {
            let msg = ''
            if (err.errors.username) {
              msg += err.errors.username.properties.message
            }
            if (err.errors.email) {
              if (msg !== '') msg += ' || '
              msg += err.errors.email.properties.message
            }
            return res.status(401).json({ msg })
          }
          next(err)
        })
    })
  },

  updateUserData: (req, res, next) => {
    if (typeof req.body.password === 'undefined' || (typeof req.body.username === 'undefined' && typeof req.body.email === 'undefined')) {
      return res.status(401).json({ msg: 'Empty fields' })
    }

    User.findOne({ _id: req.userId })
      .then(user => {
        bcrypt.compare(req.body.password, user.password)
          .then(result => {
            if (!result) return res.status(401).json({ msg: 'Auth failed' })

            const newData = {}
            if (req.body.username) newData.username = req.body.username
            if (req.body.email) newData.email = req.body.email

            User.findByIdAndUpdate({ _id: req.userId }, newData)
              .then(user => {
                return res.status(200).json({ msg: 'User data updated updated successfully' })
              })
              .catch(err => next(err))
          })
      })
  },

  updateUserPassword: (req, res, next) => {
    if (typeof req.body.password === 'undefined' || typeof req.body.oldPassword === 'undefined') {
      return res.status(401).json({ msg: 'Empty fields' })
    }

    User.findOne({ _id: req.userId })
      .then(user => {
        bcrypt.compare(req.body.oldPassword, user.password)
          .then(result => {
            if (!result) return res.status(401).json({ msg: 'Auth failed' })

            bcrypt.hash(req.body.password, 10).then(hash => {
              User.findByIdAndUpdate({ _id: req.userId }, { password: hash })
                .then(user => {
                  return res.status(200).json({ msg: 'Password updated successfully' })
                })
                .catch(err => {
                  if (err.name === 'ValidationError') {
                    let msg = ''
                    if (err.errors.username) {
                      msg += err.errors.username.properties.message
                    }
                    if (err.errors.email) {
                      if (msg !== '') msg += ' || '
                      msg += err.errors.email.properties.message
                    }
                    return res.status(401).json({ msg })
                  }
                  next(err)
                })
            })
          })
      })
  },

  updateUserAvatar: (req, res, next) => {
    if (!req.body.avatarId) return res.status(400).json({ msg: 'Any avatar was selected' })

    UserStat.findOne({ user_id: req.userId })
      .then(userStats => {
        Avatar.findById(req.body.avatarId)
          .then(avatar => {
            if (userStats.level < avatar.lvl) return res.status(400).json({ msg: "You don't have the required level to use this avatar" })
            User.findByIdAndUpdate({ _id: req.userId }, { avatar: avatar.image })
              .then(result => {
                return res.status(200).json({ msg: 'Avatar changed successfully' })
              })
              .catch(err => next(err))
          })
          .catch(err => next(err))
      })
      .catch(err => next(err))
  },

  getAuthUser: (req, res, next) => {
    User.findOne({ _id: req.userId })
      .then(user => {
        return res.status(200).json(user)
      })
      .catch(err => next(err))
  },

  getUserProfile: (req, res, next) => {
    User.findOne({ _id: req.params.userid }).select({ username: 1, avatar: 1 })
      .then(user => {
        return res.status(200).json(user)
      })
      .catch(err => next(err))
  },

  getUserStats: (req, res, next) => {
    const userId = req.params.userid !== 'undefined' ? req.params.userid : req.userId
    UserStat.findOne({ user_id: userId })
      .then(userStats => {
        userStats = JSON.parse(JSON.stringify(userStats))
        const nextLvlXp = nextLvlXP(userStats.level)
        userStats.nextLvlXp = nextLvlXp
        return res.status(200).json(userStats)
      })
      .catch(err => next(err))
  },

  getAllUsers: (req, res, next) => {
    const query = { isAdmin: false }
    // filters
    if (req.query.email) query.email = { $regex: '.*' + req.query.email + '.*', $options: 'i' }
    if (req.query.username) query.username = { $regex: '.*' + req.query.username + '.*', $options: 'i' }
    if (req.query.creationDate) {
      const start = new Date(req.query.creationDate)
      const end = new Date(req.query.creationDate).setHours(23, 59, 59, 999)
      query.creationDate = { $gte: start, $lte: end }
    }
    User.find(query)
      .then(users => {
        return res.status(200).json(users)
      })
      .catch(err => next(err))
  }
}

module.exports = controller
