const {
  sendResetPassword,
  getResetPassword,
  resetPasswordCtrl
} = require('../controller/auth/password');
const router = require('express').Router();

//api/password/reset-password-link
router.post('/reset-password-link', sendResetPassword);

//api/password/reset-password/:userId/:token
router.route('/reset-password/:userId/:token').get(getResetPassword).post(resetPasswordCtrl);
module.exports = router;