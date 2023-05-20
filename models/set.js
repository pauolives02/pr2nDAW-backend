const mongoose = require('mongoose')

const setSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  exercises: [
    {
      exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
      repetitions: { type: Number, required: true }
    }

  ],
  public: { type: Boolean, required: true, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

setSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Set', setSchema)
