const mongoose = require('mongoose')

const suggestionSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  description: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now }
})

suggestionSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Suggestion', suggestionSchema)
