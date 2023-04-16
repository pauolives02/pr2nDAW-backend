const Exercise = require('../models/exercise')
const UserSubscription = require('../models/userSubscription')

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
        UserSubscription.findOne({ user_id: req.userId, type: 'Exercise' })
          .then(result => {
            if (!result || result.subscriptions.length === 0) {
              return res.status(200).json(exercises)
            }
            exercises = JSON.parse(JSON.stringify(exercises))
            const subscriptions = JSON.parse(JSON.stringify(result.get('subscriptions')))
            exercises.forEach((exercise, i) => {
              exercises[i] = { ...exercises[i], isSubscribed: subscriptions.includes(exercise.id) }
            })

            return res.status(200).json(exercises)
          })
        // // exercises = exercises.map(exercise => { return exercise })
        // exercises = JSON.parse(JSON.stringify(exercises))
        // // let newExercises = []
        // exercises.forEach((exercise, i) => {
        //   UserSubscription.findOne({ user_id: req.userId, type: 'Exercise', subscriptions: { $in: [exercise.id] } })
        //     .then(result => {
        //       exercises[i] = { ...exercises[i], isSubscribed: !!result }
        //       if (i === exercises.length - 1) {
        //         console.log(exercises)
        //         return res.status(200).json(exercises)
        //       }
        //     })
        // })
        // return res.status(200).json(exercises)
      })
      .catch(err => {
        next(err)
      })
  },

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
              exercises[i] = { ...exercises[i], isSubscribed: subscriptions.includes(exercise.id) }
            })

            return res.status(200).json(exercises)
          })
      })
      .catch(err => {
        next(err)
      })
  },

  subscriptions: (req, res, next) => {
    const type = 'Exercise'
    UserSubscription.findOne({ user_id: req.userId, type, subscriptions: { $ne: [] } }).populate('subscriptions')
      .then(result => {
        if (!result) {
          return res.status(200).json([])
        }
        const exercises = JSON.parse(JSON.stringify(result.get('subscriptions')))
        exercises.forEach((exercise, i) => {
          exercises[i] = { ...exercises[i], isSubscribed: true }
        })
        return res.status(200).json(exercises)
      })
      .catch(err => {
        next(err)
      })
  },

  addSubscription: (req, res, next) => {
    const type = 'Exercise'
    const { id } = req.body
    console.log(id)
    UserSubscription.findOneAndUpdate({ user_id: req.userId, type }, { $addToSet: { subscriptions: id } }, { new: true })
      .then(result => {
        return res.status(200).json(result)
      })
      .catch(err => {
        next(err)
      })
  },

  removeSubscription: (req, res, next) => {
    const type = 'Exercise'
    const { id } = req.body
    UserSubscription.findOneAndUpdate({ user_id: req.userId, type }, { $pull: { subscriptions: id } }, { new: true })
      .then(result => {
        return res.status(200).json(result)
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
