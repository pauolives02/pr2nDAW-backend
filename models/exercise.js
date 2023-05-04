const mongoose = require('mongoose')

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  finished_xp: { type: Number, required: true, default: 1 },
  public: { type: Boolean, required: true, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

exerciseSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Exercise', exerciseSchema)
