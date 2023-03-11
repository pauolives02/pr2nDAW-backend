const User = require('../models/user')
const fs = require('fs')
const avatarsDirectory = './assets/img/avatars'

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
  },

  avatars: function (req, res) {
    const avatarList = []

    fs.readdir(avatarsDirectory, (err, files) => {
      if (err) return console.log(err)

      files.forEach(file => {
        avatarList.push({
          name: 'Avatar ' + file.split('.')[0],
          path: '/public/img/avatars/' + file
        })
      })

      avatarList.sort((a, b) => (a.name.replace('Avatar ', '')) - (b.name.replace('Avatar ', '')))

      return res.status(200).json(avatarList)
    })
  }
}

module.exports = controller
