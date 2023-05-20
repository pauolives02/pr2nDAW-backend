// const User = require('../models/user')
const UserSubscription = require('../models/userSubscription')
const UserDailyGoal = require('../models/userDailyGoal')

const controller = {
  getDailyGoal: (req, res, next) => {
    UserSubscription.find({ user_id: req.userId })
      .then(userSubscriptions => {
        const subscriptionsIds = []
        const subs = []
        userSubscriptions.forEach(userSubscription => {
          if (userSubscription.subscriptions.length > 0) {
            userSubscription.subscriptions.forEach(subscription => {
              // console.log(subscription._id)
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
  }
}

module.exports = controller
