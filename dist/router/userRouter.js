const {
  getAllUser,
  getUser,
  updateUser,
  usersCount,
  uploadPhoto,
  deleteUser,
  deleteProfileUser
} = require('../controller/users/userController');
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndUserOnly,
  verifyTokenAuthorization
} = require('../middleware/verifyToken');
const validObjectId = require('../middleware/validObjectId');
const photoUpload = require('../middleware/photoupload');
const router = require('express').Router();
router.route('/profile').get(verifyTokenAndAdmin, getAllUser);
router.route('/profile/count').get(verifyTokenAndAdmin, usersCount);
router.post('/profile/upload-photo', verifyToken, photoUpload.single("image"), uploadPhoto);
//user
router.route('/profile/:id').get(validObjectId, getUser).put(verifyTokenAndUserOnly, updateUser).delete(validObjectId, verifyTokenAuthorization, deleteProfileUser);
module.exports = router;