require('dotenv').config()
const fs = require('fs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
// const UserSubscription = require('../models/userSubscription')
const avatarsDirectory = './assets/img/avatars'

const controller = {
  login: function (req, res) {
    // const { username, password } = req.body
    // const user = await User.findOne({ email: username })

    // const validPassword = await bcrypt.compare(password, user.password)

    // if (!user || !validPassword) {
    //   return res.status(401).json({
    //     msg: 'Auth failed'
    //   })
    // }

    // const token = jwt.sign(
    //   {
    //     userId: user._id,
    //     isAdmin: user.isAdmin
    //   },
    //   process.env.SECRET,
    //   { expiresIn: '1h' }
    // )

    // return res.status(200).json({
    //   token,
    //   expiresIn: 3600
    // })
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
          console.log(result)
          // const setSubscription = new UserSubscription({
          //   user_id: result._id,
          //   type: 'Set',
          //   subscriptions: []
          // })
          // const exerciseSubscription = new UserSubscription({
          //   user_id: result._id,
          //   type: 'Exercise',
          //   subscriptions: []
          // })
          // setSubscription.save()
          // exerciseSubscription.save()
          res.status(201).json({
            msg: 'User created'
          })
        })
        .catch(err => {
          res.status(500).json({
            msg: err
          })
        })
    })
  },

  avatars: function (req, res) {
    const avatarList = []

    fs.readdir(avatarsDirectory, (err, files) => {
      if (err) return console.log(err)

      files.forEach(file => {
        avatarList.push({
          name: 'Avatar ' + file.split('.')[0],
          path: '/public/img/avatars/' + file
        })
      })

      avatarList.sort((a, b) => (a.name.replace('Avatar ', '')) - (b.name.replace('Avatar ', '')))

      return res.status(200).json(avatarList)
    })
  },

  getAuthUser: function (req, res) {
    User.findOne({ _id: req.userId })
      .then(user => {
        return res.status(200).json(user)
      })
  }
}

module.exports = controller
