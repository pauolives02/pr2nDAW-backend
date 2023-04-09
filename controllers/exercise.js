const Exercise = require('../models/exercise')

const controller = {
  all: (req, res) => {
    Exercise.find({})
      .then(exercises => {
        return res.status(200).json(exercises)
      })
  },

  public: (req, res) => {
    Exercise.find({ public: true })
      .then(exercises => {
        return res.status(200).json(exercises)
      })
  },

  private: (req, res) => {
    Exercise.find({ public: false, owner: req.userId })
      .then(exercises => {
        return res.status(200).json(exercises)
      })
  },

  add: (req, res) => {
    const newExercise = new Exercise({
      name: req.body.name,
      description: req.body.description,
      image: req.body.image,
      finished_xp: req.body.finished_xp,
      owner: req.userId
    })

    newExercise.save()
      .then(result => {
        res.status(201).json({
          message: 'Exercise created',
          exercise: result
        })
      })
      .catch(err => {
        res.status(500).json({
          message: err
        })
      })
  }
}

module.exports = controller
