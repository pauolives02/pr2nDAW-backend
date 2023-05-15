const Set = require('../models/set')
const UserSubscription = require('../models/userSubscription')

// const { v4: uuidv4 } = require('uuid')
// const checkImageType = require('../helpers/checkImageType')
const path = require('path')
const fs = require('fs')

const controller = {
  all: (req, res, next) => {
    const query = {}
    let populate = 'owner'
    // filters
    if (req.query.name) query.name = { $regex: '.*' + req.query.name + '.*', $options: 'i' }
    if (req.query.description) query.description = { $regex: '.*' + req.query.description + '.*', $options: 'i' }
    if (req.query.finished_xp) query.finished_xp = req.query.finished_xp
    if (req.query.public) query.public = req.query.public
    if (req.query.owner) {
      populate = { path: 'owner', select: 'username', match: { username: { $regex: '.*' + req.query.owner + '.*', $options: 'i' } } }
    }

    Set.find({}).populate(populate)
      .then(sets => {
        if (req.query.owner) {
          sets = sets.filter(exercise => exercise.owner != null)
        }
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

  delete: (req, res, next) => {
    const query = { _id: req.params.id }
    if (!req.isAdmin) query.owner = req.userId
    Set.findOneAndRemove(query)
      .then(set => {
        if (set) {
          fs.unlinkSync('./uploads/sets/' + set.image)
          set = { ...set, msg: 'Set deleted successfully' }
          res.json(set)
        } else {
          res.status(404).json({ error: 'Not found' })
        }
      })
      .catch(err => next(err))
  },

  getImage: (req, res, next) => {
    const file = req.params.image
    const filePath = './uploads/sets/' + file

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
