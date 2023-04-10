const Exercise = require('../models/exercise')
const { v4: uuidv4 } = require('uuid')
const checkImageType = require('../helpers/checkImageType')
const path = require('path')
const fs = require('fs')

const controller = {
  all: (req, res, next) => {
    Exercise.find({})
      .then(exercises => {
        return res.status(200).json(exercises)
      })
      .catch(err => {
        next(err)
      })
  },

  public: (req, res, next) => {
    Exercise.find({ public: true })
      .then(exercises => {
        return res.status(200).json(exercises)
      })
      .catch(err => {
        next(err)
      })
  },

  private: (req, res, next) => {
    Exercise.find({ public: false, owner: req.userId })
      .then(exercises => {
        return res.status(200).json(exercises)
      })
      .catch(err => {
        next(err)
      })
  },

  getById: (req, res, next) => {
    const { id } = req.params
    Exercise.findById(id)
      .then(exercise => {
        return exercise
          ? res.status(200).json(exercise)
          : res.status(404).json({ msg: 'Exercise not found' })
      })
      .catch(err => {
        next(err)
      })
  },

  add: (req, res, next) => {
    const file = req.files.image
    const fileExtension = file.name.split('.').pop()

    if (checkImageType({ extension: fileExtension, mimeType: file.mimetype })) {
      const fileName = uuidv4() + '.' + fileExtension

      file.mv('./uploads/exercises/' + fileName, function (err, success) {
        if (err) return next(err)

        let isPublic = false
        let xp = 1

        if (req.isAdmin) {
          isPublic = req.body.public
          xp = req.body.finished_xp
        }

        const newExercise = new Exercise({
          name: req.body.name,
          description: req.body.description,
          image: fileName,
          finished_xp: xp,
          public: isPublic,
          owner: req.userId
        })

        newExercise.save()
          .then(result => {
            res.status(201).json({
              msg: 'Exercise created',
              exercise: result
            })
          })
          .catch(err => {
            next(err)
          })
      })
    }
  },

  getImage: (req, res, next) => {
    const file = req.params.image
    const filePath = './uploads/exercises/' + file

    fs.access(filePath, (err) => {
      if (!err) {
        return res.sendFile(path.resolve(filePath))
      } else {
        return res.status(200).send({ msg: 'No image found' })
      }
    })
  }
}

module.exports = controller
