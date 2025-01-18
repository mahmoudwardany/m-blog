const {
  createCommentCtrl,
  getCommentCtrl,
  deleteCommentCtrl,
  updateCommentCtrl
} = require('../controller/comments/comment');
const validObjectId = require('../middleware/validObjectId');
const {
  verifyToken,
  verifyTokenAndAdmin
} = require('../middleware/verifyToken');
const router = require('express').Router();
router.route('/').post(verifyToken, createCommentCtrl).get(verifyTokenAndAdmin, getCommentCtrl);
router.route("/:id").delete(validObjectId, verifyToken, deleteCommentCtrl).put(validObjectId, verifyToken, updateCommentCtrl);
module.exports = router;