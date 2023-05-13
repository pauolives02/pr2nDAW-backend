const mongoose = require('mongoose')

const avatarSchema = new mongoose.Schema({
  image: { type: String, required: true, unique: true },
  lvl: { type: Number, required: true },
  default: { type: Boolean, required: true, default: false }
})

avatarSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Avatar', avatarSchema)
