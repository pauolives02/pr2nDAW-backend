require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const UserStat = require('../models/userStat')

const nextLvlXP = require('../helpers/nextLvlXP')

const controller = {
  login: function (req, res) {
    let fetchedUser
    User.findOne({ email: req.body.username })
      .then(user => {
        if (!user) {
          return false
        }
        fetchedUser = user
        return bcrypt.compare(req.body.password, user.password)
      })
      .then(result => {
        if (!result) {
          return res.status(401).json({
            msg: 'Auth failed'
          })
        }

        // Crear un nou token
        const token = jwt.sign(
          {
            userId: fetchedUser._id,
            isAdmin: fetchedUser.isAdmin
          },
          process.env.SECRET,
          { expiresIn: '1h' }
        )
        return res.status(200).json({
          token,
          expiresIn: 3600
        })
      })
      .catch(err => {
        console.error(err)
        return res.status(401).json({
          msg: 'Auth failed'
        })
      })
  },

  register: function (req, res) {
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

          // res.status(201).json({
          //   msg: 'User created'
          // })

          // Crear un nou token
          const token = jwt.sign(
            {
              userId: result._id,
              isAdmin: result.isAdmin
            },
            process.env.SECRET,
            { expiresIn: '1h' }
          )
          return res.status(200).json({
            token,
            expiresIn: 3600
          })
        })
        .catch(err => {
          res.status(500).json({
            msg: err
          })
        })
    })
  },

  getAuthUser: function (req, res) {
    User.findOne({ _id: req.userId })
      .then(user => {
        return res.status(200).json(user)
      })
  },

  getUserStats: function (req, res) {
    UserStat.findOne({ user_id: req.userId })
      .then(userStats => {
        userStats = JSON.parse(JSON.stringify(userStats))
        const nextLvlXp = nextLvlXP(userStats.level)
        userStats.nextLvlXp = nextLvlXp
        return res.status(200).json(userStats)
      })
  },

  getAllUsers: function (req, res, next) {
    User.find({ isAdmin: false })
      .then(users => {
        return res.status(200).json(users)
      })
      .catch(err => {
        next(err)
      })
  }
}

module.exports = controller
