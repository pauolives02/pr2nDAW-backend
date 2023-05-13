const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const checkImageType = require('../helpers/checkImageType')

const Avatar = require('../models/avatar')

const controller = {
  getAll: function (req, res, next) {
    Avatar.find({ default: false }).sort({ lvl: 1 })
      .then(avatars => {
        return res.status(200).json(avatars)
      })
      .catch(err => next(err))
  },

  getAvatar: function (req, res) {
    const file = req.params.avatar
    const filePath = './uploads/avatars/' + file
    const defaultAvatar = './uploads/avatars/default.svg'

    fs.access(filePath, (err) => {
      if (!err) {
        return res.sendFile(path.resolve(filePath))
      } else {
        return res.sendFile(path.resolve(defaultAvatar))
      }
    })
  },

  uploadAvatar: function (req, res, next) {
    const file = req.files.image
    const fileExtension = file.name.split('.').pop()

    if (checkImageType({ extension: fileExtension, mimeType: file.mimetype })) {
      const fileName = uuidv4() + '.' + fileExtension

      file.mv('./uploads/avatars/' + fileName, function (err, success) {
        if (err) return next(err)

        const avatar = new Avatar({
          image: fileName,
          lvl: req.body.lvl
        })

        avatar.save()
          .then(result => {
            res.status(201).json({
              msg: 'Avatar added successfully',
              avatar: result
            })
          })
          .catch(err => next(err))
      })
    }
  },

  updateAvatar: function (req, res, next) {
    Avatar.findByIdAndUpdate(req.params.id, { lvl: req.body.lvl })
      .then(result => {
        if (result) {
          res.status(200).json({ msg: 'Avatar updated successfully' })
        } else {
          res.status(404).json({ error: 'Not found' })
        }
      })
      .catch(err => next(err))
  },

  deleteAvatar: function (req, res, next) {
    const { id } = req.params
    Avatar.findByIdAndRemove(id)
      .then(item => {
        if (item) {
          item = { ...item, msg: 'Avatar deleted successfully' }
          res.json(item)
        } else {
          res.status(404).json({ error: 'Not found' })
        }
      })
      .catch(err => next(err))
  }
}

module.exports = controller
