const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  isAdmin: { type: Boolean, required: true, default: false },
  creationDate: { type: Date, required: true, default: new Date() }
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.password
  }
})

userSchema.plugin(uniqueValidator, { message: '{VALUE} already exists' })

module.exports = mongoose.model('User', userSchema)
