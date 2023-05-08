const mongoose = require('mongoose')

const suggestionSubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  default: { type: Boolean, default: false }
})

suggestionSubjectSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('suggestionSubject', suggestionSubjectSchema)
