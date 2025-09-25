const userModel = require('../model/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { signUpTemplate, verificationTemplate, resetPasswordTemplate } = require('../utils/emailTemplate')
const emailSender = require('../middlewares/nodemailer')

exports.signUp = async (req, res) => {
  const { firstName, lastName, email, password } = req.body
  try {
    const checkUser = await userModel.findOne({ email: email?.toLowerCase() })

    if (checkUser) {
      return res.status(400).json({
        message: 'user already exists',
      })
    }

    // encrypt user password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = new userModel({ firstName, lastName, email, password: hashedPassword })
    const savedUser = await user.save()

    // generate a token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '2mins',
    })

    const link = `${req.protocol}://${req.get('host')}/users/verify/${token}`
    console.log('link : ', link)

    // Email options for sending email
    const emailOption = {
      email: user.email,
      subject: 'Graduation note',
      html: signUpTemplate(link, user.firstName),
    }

    // send the email to the user
    await emailSender(emailOption)

    // send a response
    return res.status(201).json({
      message: 'Sign up successfull',
      data: savedUser,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Error signing up',
      error: error.message,
    })
  }
}

exports.verifyUser = async (req, res) => {
  const { token } = req.params
  try {
    if (!token) {
      return res.status(404).json({
        message: 'token not found',
      })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await userModel.findById(decoded.id)
    if (!user) {
      return res.status(404).json({
        message: 'user not found',
      })
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: 'User already verified, please proceed to login',
      })
    }
    user.isVerified = true
    await user.save()

    return res.status(200).json({
      message: 'User verified',
    })
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(500).json({
        message: 'Session expired, please resend verification',
      })
    }
    return res.status(500).json({
      message: 'Error verifying user',
      data: error.message,
    })
  }
}

exports.resendVerification = async (req, res) => {
  const { email } = req.body
  try {
    const user = await userModel.findOne({ email: email.toLowerCase() })

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: 'User already verified, please proceed to login',
      })
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '20mins',
    })

    const link = `${req.protocol}://${req.get('host')}/users/verify/${token}`

    const emailOptions = {
      email: user.email,
      subject: 'Verification Email',
      html: verificationTemplate(link, user.firstName),
    }

    await emailSender(emailOptions)

    return res.status(200).json({
      message: ' resend verification Link successfully sent',
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Error with verfication',
      error: error.message,
    })
  }
}

exports.loginUser = async (req, res) => {
  // extract the required fields

  const { email, password } = req.body
  try {
    // find the user with the email
    const user = await userModel.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(404).json({
        message: 'user not found, please create an account',
      })
    }

    // check password
    const checkPassword = await bcrypt.compare(password, user.password)
    if (!checkPassword) {
      return res.status(400).json({
        message: 'Password mismatch',
      })
    }

    if (user.isVerified === false) {
      return res.status(401).json({
        message: 'user not verified, please check your email for verification link',
      })
    }

    // Generate a token for the new user

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1hr' })
    return res.status(500).json({
      message: 'log in successfull',
      data: user,
      token: token,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Error logging in user',
      error: error.message,
    })
  }
}

exports.forgotPassword = async (req, res) => {
  const { email } = req.body

  // find the user with the email and check if they exist

  try {
    const user = await userModel.findOne({ email: email.toLowerCase() })

    if (!user) {
      return res.status(500).json({
        message: 'Error',
      })
    }

    // generate a token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '10mins',
    })

    const link = `${req.protocol}://${req.get('host')}/users/reset/Password/${token}`

    // create email options
    const emailOptions = {
      email: user.email,
      subject: 'Reset Password',
      html: resetPasswordTemplate(link, user.firstName),
    }

    // send email
    await emailSender(emailOptions)

    return res.status(200).json({
      message: 'forgot password request sent',
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Error ',
      error: error.message,
    })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    // get token from the params
    const { token } = req.params
    // extract the password from req.body
    const { newPassword, confirmPassword } = req.body
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'Password does not match',
      })
    }

    // verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // find the user decoded
    const user = await userModel.findById(decoded.id)

    // check if the user is in the database
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    // encrypt the new passsword

    const salted = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salted)

    // update the user password
    user.password = hashedPassword
    await user.save()

    return res.status(200).json({
      message: 'Password reset successful',
    })
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(500).json({
        message: 'link expired, please request a new link ',
      })
    }
    return res.status(500).json({
      message: 'Error ',
      error: error.message,
    })
  }
}

exports.changePassword = async (req, res) => {
  const { token } = req.params
  // input the old and new password
  const { oldPassword, newPassword, confirmNewPassword } = req.body
  try {
    // verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // find the user with the token
    const user = await userModel.findById(decoded.id)
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    // compare the oldPasswords
    const oldPasswordCheck = await bcrypt.compare(oldPassword, user.password)
    if (!oldPasswordCheck) {
      return res.status(400).json({
        message: 'password mismatch',
      })
    }

    // confirm new password
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        message: 'new password mismatch',
      })
    }

    // hash the new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // save the new password
    user.password = hashedPassword
    await user.save()

    return res.status(200).json({
      message: 'password changed successfully',
    })
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(500).json({
        message: 'Session timed out, Please login to your account',
      })
    }
    return res.status(500).json({
      message: 'Error changing password',
      error: error.message,
    })
  }
}
