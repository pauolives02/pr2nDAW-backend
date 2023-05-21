const UserSubscription = require('../models/userSubscription')
const UserDailyGoal = require('../models/userDailyGoal')
const UserStat = require('../models/userStat')

const nextLvlXP = require('../helpers/nextLvlXP')

const controller = {
  getDailyGoal: (req, res, next) => {
    UserSubscription.find({ user_id: req.userId })
      .then(userSubscriptions => {
        const subscriptionsIds = []
        const subs = []
        userSubscriptions.forEach(userSubscription => {
          if (userSubscription.subscriptions.length > 0) {
            userSubscription.subscriptions.forEach(subscription => {
              subscriptionsIds.push(subscription.subscription)
              subs.push({
                user_id: req.userId,
                subscription: subscription.subscription,
                subscriptionType: userSubscription.type,
                repetitions: subscription.repetitions
              })
            })
          }
        })

        if (subscriptionsIds.length === 0) return res.status(200).json([])

        const date = new Date()
        const startDay = date.setHours(0, 0, 0, 0)
        const endDay = date.setHours(23, 59, 59, 999)

        UserDailyGoal.find({ user_id: req.userId, subscription: { $in: subscriptionsIds }, date: { $gte: startDay, $lte: endDay } }).populate('subscription')
          .then(dailyGoals => {
            if (dailyGoals.length !== 0) {
              return res.status(200).json(dailyGoals)
            } else {
              controller.insertDailyGoal(req, res, next, subs)
            }
          })
          .catch(err => next(err))
      })
      .catch(err => next(err))
  },

  insertDailyGoal: (req, res, next, subscriptions) => {
    UserDailyGoal.insertMany(subscriptions)
      .then(() => controller.getDailyGoal(req, res, next))
  },

  getDailyGoalById: (req, res, next) => {
    const date = new Date()
    const startDay = date.setHours(0, 0, 0, 0)
    const endDay = date.setHours(23, 59, 59, 999)
    const populate = { path: 'subscription', populate: { path: 'exercises.exercise', strictPopulate: false } }
    UserDailyGoal.findOne({ _id: req.params.id, user_id: req.userId, date: { $gte: startDay, $lte: endDay } }).populate(populate)
      .then(dailyGoal => {
        if (!dailyGoal) return res.status(404).json({ msg: 'Goal not found' })

        if (dailyGoal.repetitions === dailyGoal.completed_repetitions) return res.status(400).json({ msg: 'This goal has already been completed' })

        if (dailyGoal.finished_exercises.length !== 0) {
          return res.status(200).json(dailyGoal)
        } else {
          const newData = {}
          if (dailyGoal.subscriptionType === 'Exercise') {
            newData.finished_exercises = [0]
          } else {
            newData.finished_exercises = []
            dailyGoal.subscription.exercises.forEach(() => newData.finished_exercises.push(0))
          }
          UserDailyGoal.findByIdAndUpdate(dailyGoal._id, newData, { new: true }).populate(populate)
            .then(dailyGoal => {
              return res.status(200).json(dailyGoal)
            })
            .catch(error => next(error))
        }
      })
      .catch(err => next(err))
  },

  updateDailyGoal: (req, res, next) => {
    UserDailyGoal.findById(req.params.id).populate({ path: 'subscription', populate: { path: 'exercises.exercise', strictPopulate: false } })
      .then(dailyGoal => {
        if (dailyGoal.repetitions === dailyGoal.completed_repetitions) return res.status(400).json({ msg: 'This goal has already been completed' })

        const exerciseXPammount = { }
        if (dailyGoal.subscriptionType === 'Exercise') {
          if (req.body.step !== 0 || req.body.ammount <= 0 || req.body.ammount > dailyGoal.repetitions || req.body.ammount < dailyGoal.finished_exercises[req.body.step]) {
            return res.status(400).json({ msg: 'Invalid parameters' })
          }

          exerciseXPammount.xp = dailyGoal.subscription.finished_xp
          exerciseXPammount.ammount = req.body.ammount - dailyGoal.finished_exercises[req.body.step]

          dailyGoal.finished_exercises[req.body.step] = req.body.ammount

          if (dailyGoal.finished_exercises[req.body.step] === dailyGoal.repetitions) {
            dailyGoal.completed_repetitions = dailyGoal.finished_exercises[req.body.step]
          }
        } else {
          if (req.body.step < 0 || req.body.step > 8 || req.body.ammount <= 0 || req.body.ammount > dailyGoal.subscription.exercises[req.body.step].repetitions || req.body.ammount < dailyGoal.finished_exercises[req.body.step]) {
            return res.status(400).json({ msg: 'Invalid parameters' })
          }
          exerciseXPammount.xp = dailyGoal.subscription.exercises[req.body.step].exercise.finished_xp
          exerciseXPammount.ammount = req.body.ammount - dailyGoal.finished_exercises[req.body.step]

          dailyGoal.finished_exercises[req.body.step] = req.body.ammount

          let completed = true
          for (let i = 0; i < dailyGoal.subscription.exercises.length; i++) {
            if (dailyGoal.subscription.exercises[i].repetitions !== dailyGoal.finished_exercises[i]) {
              completed = false
            }
          }

          if (completed) {
            dailyGoal.finished_exercises = []
            dailyGoal.subscription.exercises.forEach(() => dailyGoal.finished_exercises.push(0))
            dailyGoal.completed_repetitions += 1
          }
        }

        dailyGoal.save()
          .then(dailyGoal => {
            UserStat.findOne({ user_id: req.userId })
              .then(userStat => {
                const earnedXP = exerciseXPammount.xp * exerciseXPammount.ammount
                const newXP = userStat.current_xp + earnedXP
                let newLevel = userStat.level

                while (nextLvlXP(newLevel) < newXP) {
                  newLevel++
                }

                if (userStat.level !== newLevel) userStat.level = newLevel
                userStat.current_xp = newXP
                userStat.exercises_completed = exerciseXPammount.ammount

                userStat.save()
                  .then(result => {
                    dailyGoal.completed_repetitions === dailyGoal.repetitions
                      ? res.status(200).json({ dailyGoal, msg: 'Goal completed!', completed: true })
                      : res.status(200).json({ dailyGoal, msg: 'Goal updated successfully' })
                  })
                  .catch(err => next(err))
              })
          })
          .catch(err => next(err))
      })
      .catch(err => next(err))
  }
}

module.exports = controller
