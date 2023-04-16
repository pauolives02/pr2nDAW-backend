const mongoose = require('mongoose')

const userSubscriptionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscriptions: [{ type: mongoose.Schema.Types.ObjectId, refPath: 'type' }],
  type: { type: String, required: true, enum: ['Set', 'Exercise'] }
})

userSubscriptionSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema)
