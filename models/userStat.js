const mongoose = require('mongoose')

const userStatSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level: { type: Number, default: 1 },
  current_xp: { type: Number, default: 0 },
  exercises_completed: { type: Number, default: 0 }
})

userStatSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('UserStat', userStatSchema)
