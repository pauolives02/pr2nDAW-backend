module.exports = function (lvl /* X */) {
  const baseXP = 50 // Y
  const extraXP = 100 // Z
  // X*Y+(X/2*((Z+Z*(X-1))+Z))
  const nextLvlXP = lvl * baseXP + (lvl / 2 * ((extraXP + extraXP * (lvl - 1)) + extraXP))
  return nextLvlXP
}
