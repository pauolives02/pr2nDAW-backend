const ERRORS = {
  CastError: res => res.status(400).send({ msg: 'id used is malformed' }),
  ValidationError: (res, err) => res.status(409).send({ msg: err.message }),
  JsonWebTokenError: res => res.status(401).send({ msg: 'Token missing or invalid' }),
  TokenExpiredError: res => res.status(401).send({ msg: 'Token expired' }),
  DefaultError: res => res.status(500).send({ msg: 'An error has ocurred' })
}
module.exports = (err, req, res, next) => {
  console.log(err.name)
  console.log(err.message)
  console.log(err)

  const handler = ERRORS[err.name] || ERRORS.DefaultError
  handler(res, err)
}
