const User = require('../models/user')

const controller = {
  login: function (req, res) {
    return res.status(200).send({
      msg: 'Pagina'
    })
  },

  register: function (req, res) {
    return res.status(200).send({
      msg: 'Pagina'
    })
  }
}

module.exports = controller
