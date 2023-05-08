const Set = require('../models/set')
const UserSubscription = require('../models/userSubscription')

// const { v4: uuidv4 } = require('uuid')
// const checkImageType = require('../helpers/checkImageType')
const path = require('path')
const fs = require('fs')

const controller = {
  all: (req, res, next) => {
    Set.find({}).populate('owner')
      .then(sets => {
        return res.status(200).json(sets)
      })
      .catch(err => {
        next(err)
      })
  },

  public: (req, res, next) => {
    Set.find({ public: true })
      .then(sets => {
        return res.status(200).json(sets)
      })
      .catch(err => {
        next(err)
      })
  },

  private: (req, res, next) => {
    Set.find({ public: false, owner: req.userId })
      .then(sets => {
        return res.status(200).json(sets)
      })
      .catch(err => {
        next(err)
      })
  },

  subscriptions: (req, res, next) => {
    const type = 'Set'
    UserSubscription.findOne({ user_id: req.userId, type, subscriptions: { $ne: [] } }).populate('subscriptions')
      .then(result => {
        if (!result) {
          return res.status(200).json([])
        }
        return res.status(200).json(result)
      })
      .catch(err => {
        next(err)
      })
  },

  getById: (req, res, next) => {
    const { id } = req.params
    Set.findById(id)
      .then(sets => {
        return sets
          ? res.status(200).json(sets)
          : res.status(404).json({ msg: 'Exercise not found' })
      })
      .catch(err => {
        next(err)
      })
  },

  // add: (req, res, next) => {
  //   const file = req.files.image
  //   const fileExtension = file.name.split('.').pop()

  //   if (checkImageType({ extension: fileExtension, mimeType: file.mimetype })) {
  //     const fileName = uuidv4() + '.' + fileExtension

  //     file.mv('./uploads/exercises/' + fileName, function (err, success) {
  //       if (err) return next(err)

  //       let isPublic = false
  //       let xp = 1

  //       if (req.isAdmin) {
  //         isPublic = req.body.public
  //         xp = req.body.finished_xp
  //       }

  //       const newExercise = new Exercise({
  //         name: req.body.name,
  //         description: req.body.description,
  //         image: fileName,
  //         finished_xp: xp,
  //         public: isPublic,
  //         owner: req.userId
  //       })

  //       newExercise.save()
  //         .then(result => {
  //           res.status(201).json({
  //             msg: 'Exercise created',
  //             exercise: result
  //           })
  //         })
  //         .catch(err => {
  //           next(err)
  //         })
  //     })
  //   }
  // },

  // subscription: (req, res, next) => {

  // },

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
