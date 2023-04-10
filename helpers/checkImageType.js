module.exports = function (image) {
  const imageExtension = image.extension
  const mimeType = image.mimeType

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp']

  if (allowedExtensions.includes(imageExtension) && allowedTypes.includes(mimeType)) {
    return true
  }

  return false
}
