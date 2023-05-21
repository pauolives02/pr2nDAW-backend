const Set = require('../models/set')
const Exercise = require('../models/exercise')
const UserSubscription = require('../models/userSubscription')
const UserDailyGoal = require('../models/userDailyGoal')

const { v4: uuidv4 } = require('uuid')
const checkImageType = require('../helpers/checkImageType')
const path = require('path')
const fs = require('fs')

const controller = {
  // ALL SETS
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

    Set.find(query).populate(populate)
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

  // PUBLIC SETS
  public: (req, res, next) => {
    Set.find({ public: true })
      .then(sets => {
        UserSubscription.findOne({ user_id: req.userId, type: 'Set' })
          .then(result => {
            if (!result || result.subscriptions.length === 0) {
              return res.status(200).json(sets)
            }
            sets = JSON.parse(JSON.stringify(sets))
            const subscriptions = JSON.parse(JSON.stringify(result.get('subscriptions')))
            sets.forEach(set => {
              set.isSubscribed = false
              subscriptions.forEach(sub => {
                if (set.id === sub.subscription) {
                  set.isSubscribed = true
                }
              })
            })

            return res.status(200).json(sets)
          })
      })
      .catch(err => {
        next(err)
      })
  },

  // PRIVATE SETS
  private: (req, res, next) => {
    Set.find({ public: false, owner: req.userId })
      .then(sets => {
        UserSubscription.findOne({ user_id: req.userId, type: 'Set' })
          .then(result => {
            if (!result || result.subscriptions.length === 0) {
              return res.status(200).json(sets)
            }

            sets = JSON.parse(JSON.stringify(sets))
            const subscriptions = JSON.parse(JSON.stringify(result.get('subscriptions')))
            sets.forEach(set => {
              set.isSubscribed = false
              subscriptions.forEach(sub => {
                if (set.id === sub.subscription) {
                  set.isSubscribed = true
                }
              })
            })

            return res.status(200).json(sets)
          })
      })
      .catch(err => {
        next(err)
      })
  },

  // SETS SUBSCRIPTIONS BY USER
  subscriptions: (req, res, next) => {
    const type = 'Set'
    UserSubscription.findOne({ user_id: req.userId, type, subscriptions: { $ne: [] } }).populate('subscriptions.subscription')
      .then(result => {
        if (!result) return res.status(200).json([])

        const sets = JSON.parse(JSON.stringify(result.get('subscriptions')))
        sets.forEach(set => {
          if (set.subscription) {
            set.subscription.isSubscribed = true
          }
        })
        return res.status(200).json(sets)
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

  // ADD SET SUBSCRIPTION
  addSubscription: (req, res, next) => {
    const type = 'Set'
    const { id, repetitions } = req.body
    const subscriptionData = {
      subscription: id,
      repetitions
    }
    Set.findById(id)
      .then(set => {
        if (!set) return res.status(404).json({ msg: 'Set not found' })

        UserSubscription.findOneAndUpdate({ user_id: req.userId, type }, { $addToSet: { subscriptions: subscriptionData } }, { new: true, upsert: true })
          .then(userSubscription => {
            const date = new Date()
            const startDay = date.setHours(0, 0, 0, 0)
            const endDay = date.setHours(23, 59, 59, 999)
            UserDailyGoal.findOneAndUpdate({ user_id: req.userId, subscription: set.id, date: { $gte: startDay, $lte: endDay } }, { repetitions, subscriptionType: userSubscription.type }, { new: true, upsert: true })
              .then(result => {
                return res.status(200).json({ msg: 'Subscription added successfully' })
              })
              .catch(err => next(err))
          })
          .catch(err => next(err))
      })
      .catch(err => next(err))
  },

  // REMOVE EXERCISE SUBSCRIPTION
  removeSubscription: (req, res, next) => {
    const type = 'Set'
    const { id } = req.body
    UserSubscription.findOneAndUpdate({ user_id: req.userId, type }, { $pull: { subscriptions: { subscription: id } } }, { new: true })
      .then(result => {
        return res.status(200).json({ msg: 'Subscription removed successfully' })
      })
      .catch(err => next(err))
  },

  // ADD SET
  add: (req, res, next) => {
    if (typeof req.files.image === 'undefined' || typeof req.body.description === 'undefined' || typeof req.body.name === 'undefined' || typeof req.body.public === 'undefined' || typeof req.body.exercises === 'undefined' || req.body.exercises.length < 2) {
      return res.status(400).json({ msg: 'Empty fields' })
    }

    // Available exercises for set and filter
    let query = { $or: [{ public: true }, { $and: [{ public: false }, { owner: req.userId }] }] }
    if (req.body.public) query = { public: true }

    Exercise.find(query)
      .then(exercises => {
        exercises = JSON.parse(JSON.stringify(exercises))
        const validExercises = []
        exercises.forEach(exercise => {
          validExercises.push(exercise.id)
        })

        const formSetExercises = JSON.parse(req.body.exercises)
        formSetExercises.filter(exercise => !validExercises.includes(exercise.id) || exercise.repetitions < 1)

        const setExercises = []
        formSetExercises.forEach(exercise => {
          setExercises.push({
            exercise: exercise.id,
            repetitions: exercise.repetitions
          })
        })

        // Image verify and upload
        const file = req.files.image
        const fileExtension = file.name.split('.').pop()

        if (!checkImageType({ extension: fileExtension, mimeType: file.mimetype })) {
          return res.status(400).json({ msg: 'Invalid image type' })
        }

        const fileName = uuidv4() + '.' + fileExtension

        file.mv('./uploads/sets/' + fileName, function (err, success) {
          if (err) return next(err)
        })

        const newSet = new Set({
          name: req.body.name,
          description: req.body.description,
          image: fileName,
          owner: req.userId,
          exercises: setExercises
        })

        if (req.isAdmin) {
          if (typeof req.body.public !== 'undefined') newSet.public = req.body.public
          if (typeof req.body.finished_xp !== 'undefined') newSet.finished_xp = req.body.finished_xp
        }

        newSet.save()
          .then(result => {
            res.status(201).json({
              msg: 'Set created successfully',
              set: result
            })
          })
          .catch(err => next(err))
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

    Set.findOneAndUpdate(query, newData)
      .then(set => {
        if (set) {
          if (file && fs.existsSync('./uploads/sets/' + set.image)) {
            fs.unlinkSync('./uploads/sets/' + set.image)
          }
          res.status(200).json({ msg: 'Set updated successfully' })
        } else {
          fs.unlinkSync('./uploads/sets/' + fileName)
          res.status(404).json({ error: 'Not found' })
        }
      })
      .catch(err => {
        fs.unlinkSync('./uploads/sets/' + fileName)
        next(err)
      })
  },

  // REMOVE SET
  delete: (req, res, next) => {
    const query = { _id: req.params.id }
    if (!req.isAdmin) query.owner = req.userId
    Set.findOneAndRemove(query)
      .then(set => {
        if (set) {
          fs.unlinkSync('./uploads/sets/' + set.image)
          UserSubscription.updateMany({ type: 'Set' }, { $pull: { subscriptions: { subscription: set.id } } })
            .then(result => {
              res.status(200).json({ msg: 'Set deleted successfully' })
            })
            .catch(err => next(err))
        } else {
          res.status(404).json({ error: 'Not found' })
        }
      })
      .catch(err => next(err))
  },

  // GET SET IMAGE
  getImage: (req, res, next) => {
    const file = req.params.image
    const filePath = './uploads/sets/' + file
    const defaultImage = './uploads/sets/default.webp'

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
