const Exercise = require('../models/exercise')
const UserSubscription = require('../models/userSubscription')

const { v4: uuidv4 } = require('uuid')
const checkImageType = require('../helpers/checkImageType')
const path = require('path')
const fs = require('fs')

const controller = {
  // ALL EXERCISES
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

    Exercise.find(query).populate(populate)
      .then(exercises => {
        if (req.query.owner) {
          exercises = exercises.filter(exercise => exercise.owner != null)
        }
        return res.status(200).json(exercises)
      })
      .catch(err => next(err))
  },

  // PUBLIC EXERCISES
  public: (req, res, next) => {
    Exercise.find({ public: true })
      .then(exercises => {
        UserSubscription.findOne({ user_id: req.userId, type: 'Exercise' })
          .then(result => {
            if (!result || result.subscriptions.length === 0) {
              return res.status(200).json(exercises)
            }
            exercises = JSON.parse(JSON.stringify(exercises))
            const subscriptions = JSON.parse(JSON.stringify(result.get('subscriptions')))
            exercises.forEach((exercise, i) => {
              exercise.isSubscribed = false
              subscriptions.forEach(sub => {
                if (exercise.id === sub.subscription) {
                  exercise.isSubscribed = true
                }
              })
            })

            return res.status(200).json(exercises)
          })
      })
      .catch(err => next(err))
  },

  // PRIVATE EXERCISES
  private: (req, res, next) => {
    Exercise.find({ public: false, owner: req.userId })
      .then(exercises => {
        UserSubscription.findOne({ user_id: req.userId, type: 'Exercise' })
          .then(result => {
            if (!result || result.subscriptions.length === 0) {
              return res.status(200).json(exercises)
            }
            exercises = JSON.parse(JSON.stringify(exercises))
            const subscriptions = JSON.parse(JSON.stringify(result.get('subscriptions')))
            exercises.forEach((exercise, i) => {
              exercise.isSubscribed = false
              subscriptions.forEach(sub => {
                if (exercise.id === sub.subscription) {
                  exercise.isSubscribed = true
                }
              })
            })

            return res.status(200).json(exercises)
          })
      })
      .catch(err => next(err))
  },

  // EXERCISES SUBSCRIPTIONS BY USER
  subscriptions: (req, res, next) => {
    const type = 'Exercise'
    UserSubscription.findOne({ user_id: req.userId, type, subscriptions: { $ne: [] } }).populate('subscriptions.subscription')
      .then(result => {
        if (!result) {
          return res.status(200).json([])
        }
        const exercises = JSON.parse(JSON.stringify(result.get('subscriptions')))
        console.log(exercises)
        exercises.forEach(exercise => {
          if (exercise.subscription) {
            exercise.subscription.isSubscribed = true
          }
        })
        return res.status(200).json(exercises)
      })
      .catch(err => next(err))
  },

  // AVAILABLE EXERCISES FOR SET CREATION
  getExercisesForSet: (req, res, next) => {
    let query = { public: false, owner: req.userId }

    if (req.params.type === 'true') query = { public: true }

    Exercise.find(query)
      .then(exercises => {
        return res.status(200).json(exercises)
      })
      .catch(err => next(err))
  },

  // ADD EXERCISE SUBSCRIPTION
  addSubscription: (req, res, next) => {
    const type = 'Exercise'
    const { id, repetitions } = req.body
    const subscriptionData = {
      subscription: id,
      repetitions
    }
    UserSubscription.findOneAndUpdate({ user_id: req.userId, type }, { $addToSet: { subscriptions: subscriptionData } }, { new: true, upsert: true })
      .then(result => {
        return res.status(200).json({ msg: 'Subscription added successfully' })
      })
      .catch(err => next(err))
  },

  // REMOVE EXERCISE SUBSCRIPTION
  removeSubscription: (req, res, next) => {
    const type = 'Exercise'
    const { id } = req.body
    UserSubscription.findOneAndUpdate({ user_id: req.userId, type }, { $pull: { subscriptions: { subscription: id } } }, { new: true })
      .then(result => {
        return res.status(200).json({ msg: 'Subscription removed successfully' })
      })
      .catch(err => next(err))
  },

  // GET EXERCISE BY ID
  getById: (req, res, next) => {
    const { id } = req.params
    Exercise.findById(id)
      .then(exercise => {
        return exercise
          ? res.status(200).json(exercise)
          : res.status(404).json({ msg: 'Exercise not found' })
      })
      .catch(err => next(err))
  },

  // ADD EXERCISE
  add: (req, res, next) => {
    if (typeof req.files.image === 'undefined' || typeof req.body.description === 'undefined' || typeof req.body.name === 'undefined') {
      return res.status(400).json({ msg: 'Empty fields' })
    }

    const file = req.files.image
    const fileExtension = file.name.split('.').pop()

    if (!checkImageType({ extension: fileExtension, mimeType: file.mimetype })) {
      return res.status(400).json({ msg: 'Invalid image type' })
    }

    const fileName = uuidv4() + '.' + fileExtension

    file.mv('./uploads/exercises/' + fileName, function (err, success) {
      if (err) return next(err)
    })

    const newExercise = new Exercise({
      name: req.body.name,
      description: req.body.description,
      image: fileName,
      owner: req.userId
    })

    if (req.isAdmin) {
      if (typeof req.body.public !== 'undefined') newExercise.public = req.body.public
      if (typeof req.body.finished_xp !== 'undefined') newExercise.finished_xp = req.body.finished_xp
    }

    newExercise.save()
      .then(result => {
        res.status(201).json({
          msg: 'Exercise created successfully',
          exercise: result
        })
      })
      .catch(err => next(err))
  },

  // DELETE EXERCISE
  delete: (req, res, next) => {
    const query = { _id: req.params.id }
    if (!req.isAdmin) query.owner = req.userId
    Exercise.findOneAndRemove(query)
      .then(exercise => {
        if (exercise) {
          fs.unlinkSync('./uploads/exercises/' + exercise.image)
          UserSubscription.updateMany({ type: 'Exercise' }, { $pull: { subscriptions: { subscription: exercise.id } } })
            .then(result => {
              res.status(200).json({ msg: 'Exercise deleted successfully' })
            })
            .catch(err => next(err))
        } else {
          res.status(404).json({ error: 'Not found' })
        }
      })
      .catch(err => next(err))
  },

  // UPDATE EXERCISE
  update: (req, res, next) => {
    // File verify and upload
    let file = null
    let fileExtension = ''
    let fileName = ''
    if (req.files && typeof req.files.image !== 'undefined') {
      file = req.files.image
      fileExtension = file.name.split('.').pop()

      if (!checkImageType({ extension: fileExtension, mimeType: file.mimetype })) {
        return res.status(400).json({ msg: 'Invalid image type' })
      }

      fileName = uuidv4() + '.' + fileExtension

      file.mv('./uploads/exercises/' + fileName, function (err, success) {
        if (err) return next(err)
      })
    }

    // Update
    const query = {
      _id: req.params.id
    }
    if (!req.isAdmin) query.owner = req.userId

    const newData = {
      name: req.body.name,
      description: req.body.description
    }
    if (fileName) {
      newData.image = fileName
    }
    if (req.isAdmin) {
      if (typeof req.body.public !== 'undefined') newData.public = req.body.public
      if (typeof req.body.finished_xp !== 'undefined') newData.finished_xp = req.body.finished_xp
    }

    Exercise.findOneAndUpdate(query, newData)
      .then(exercise => {
        if (exercise) {
          if (file && fs.existsSync('./uploads/exercises/' + exercise.image)) {
            fs.unlinkSync('./uploads/exercises/' + exercise.image)
          }
          res.status(200).json({ msg: 'Exercise updated successfully' })
        } else {
          fs.unlinkSync('./uploads/exercises/' + fileName)
          res.status(404).json({ error: 'Not found' })
        }
      })
      .catch(err => {
        fs.unlinkSync('./uploads/exercises/' + fileName)
        next(err)
      })
  },

  // GET EXERCISE IMAGE
  getImage: (req, res, next) => {
    const file = req.params.image
    const filePath = './uploads/exercises/' + file
    const defaultImage = './uploads/exercises/default.webp'

    fs.access(filePath, (err) => {
      if (!err) {
        return res.sendFile(path.resolve(filePath))
      } else {
        return res.sendFile(path.resolve(defaultImage))
      }
    })
  }
}

module.exports = controller
