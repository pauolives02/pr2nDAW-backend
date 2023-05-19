const mongoose = require('mongoose')

const userDailyGoalSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscription: { type: mongoose.Schema.Types.ObjectId, refPath: 'subscriptionType', required: true },
  subscriptionType: { type: String, required: true, enum: ['Set', 'Exercise'] },
  date: { type: Date, default: new Date(), required: true },
  finished_exercises: { type: [Number], default: [], required: true },
  completed_repetitions: { type: Number, default: 0, required: true },
  repetitions: { type: Number, required: true }
})

userDailyGoalSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('UserDailyGoal', userDailyGoalSchema)
