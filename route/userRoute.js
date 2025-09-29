const express = require('express')
const {
  signUp,
  verifyUser,
  resendVerification,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
  getAllUsers,
} = require('../controller/userController')
const { authentication } = require('../middlewares/authentication')
const { signUpValidation, loginValidator } = require('../middlewares/validator')

const router = express.Router()

router.post('/users', signUpValidation, signUp)
router.get('/users/verify/:token', verifyUser)
router.post('/users/resend-verification', resendVerification)
router.post('/users/login', loginValidator, loginUser)
router.post('/users/forgot/password', forgotPassword)
router.post('/users/reset/password/:token', resetPassword)
router.post('/users/change/password/:token', changePassword)
router.get('/users', authentication, getAllUsers)
router.post('/users/changePassword', authentication, changePassword)

module.exports = router
