module.exports = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(401).json({ msg: "You don't have permission to make this request" })
  }

  next()
}
