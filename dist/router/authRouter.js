const {
  userLogin,
  verifyAccountCtrl,
  registerController
} = require('../controller/auth/auth');
const router = require('express').Router();
router.post('/register', registerController);
router.post('/login', userLogin);
//:userId/verify/:token
router.get('/:userId/verify/:token', verifyAccountCtrl);
module.exports = router;