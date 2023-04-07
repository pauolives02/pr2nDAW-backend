require('dotenv').config()
const fs = require('fs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const avatarsDirectory = './assets/img/avatars'

const controller = {
  login: function (req, res) {
    let fetchedUser
    User.findOne({ email: req.body.username })
      .then(user => {
        if (!user) {
          return res.status(401).json({
            message: 'Auth failed'
          })
        }
        fetchedUser = user
        return bcrypt.compare(req.body.password, user.password)
      })
      .then(result => {
        if (!result) {
          return res.status(401).json({
            message: 'Auth failed'
          })
        }
        // Crear un nou token
        const token = jwt.sign(
          {
            email: fetchedUser.email,
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
          message: 'Auth failed'
        })
      })
  },

  register: function (req, res) {
    bcrypt.hash(req.body.password, 10).then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash,
        isAdmin: false
      })
      user.save()
        .then(result => {
          res.status(201).json({
            message: 'User created'
          })
        })
        .catch(err => {
          res.status(500).json({
            message: err
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
  }
}

module.exports = controller
