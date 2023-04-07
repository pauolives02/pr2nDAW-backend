const mongoose = require('mongoose')

const exerciseSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  description: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Exercise', exerciseSchema)
