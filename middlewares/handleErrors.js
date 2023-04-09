const ERRORS = {
  CastError: res => res.status(400).send({ error: 'id used is malformed' }),
  ValidationError: (res, err) => res.status(409).send({ error: err.message }),
  JsonWebTokenError: res => res.status(401).send({ error: 'Token missing or invalid' }),
  TokenExpirerError: res => res.status(401).send({ error: 'Token expired' }),
  DefaultError: res => res.status(500).end()
}
module.exports = (err, req, res, next) => {
  console.log(err.name)
  console.log(err.message)
  console.log(err)

  const handler = ERRORS[err.name] || ERRORS.DefaultError
  handler(res, err)
}
