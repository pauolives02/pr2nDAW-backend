const path = require('path')
const fs = require('fs')

// const User = require('../models/user')
const Avatar = require('../models/avatar')

const controller = {
  getAll: function (req, res, next) {
    Avatar.find({})
      .then(avatars => {
        return res.status(200).json(avatars)
      })
      .catch(err => next(err))
  },

  getAvatar: function (req, res) {
    const file = req.params.avatar
    console.log(file)
    const filePath = './uploads/avatars/' + file
    const defaultAvatar = './uploads/avatars/default.png'

    fs.access(filePath, (err) => {
      if (!err) {
        return res.sendFile(path.resolve(filePath))
      } else {
        return res.sendFile(path.resolve(defaultAvatar))
      }
    })
  },

  uploadAvatar: function (req, res, next) {

  },

  deleteAvatar: function (req, res, next) {

  }
}

module.exports = controller
