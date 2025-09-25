const express = require('express')
const {
  signUp,
  verifyUser,
  resendVerification,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
} = require('../controller/userController')
const router = express.Router()

router.post('/users', signUp)
router.get('/users/verify/:token', verifyUser)
router.post('/users/resend-verification', resendVerification)
router.post('/users/login', loginUser)
router.post('/users/forgot/password', forgotPassword)
router.post('/users/reset/password/:token', resetPassword)
router.post('/users/change/password/:token', changePassword)

module.exports = router
