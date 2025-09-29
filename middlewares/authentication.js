const jwt = require('jsonwebtoken')
const userModel = require('../model/userModel')

exports.authentication = async (req, res, next) => {
  try {
    const auth = req.headers.authorization

    const token = auth.split(' ')[1]

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await userModel.findById(decoded.id)

    if (!user) {
      return res.status(404).json({
        message: 'Authentication failed, user not found',
      })
    }

    req.user = decoded

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(500).json({
        message: 'Session expired, please login to continue',
      })
    }
    return res.status(500).json({
      message: error.message,
    })
  }
}
