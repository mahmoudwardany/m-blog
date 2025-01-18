const asyncHandler = require("express-async-handler");
const {
  commentModel,
  validcreateComment,
  validupdateComment
} = require('../../models/Comments');
const {
  userModel
} = require('../../models/UserModel');

/**--------------------------------
 * @desc Create New Comment
 * @router /api/comments
 * @access private
 * @method Post
 */

module.exports.createCommentCtrl = asyncHandler(async (req, res) => {
  //1-validation
  const {
    error
  } = validcreateComment(req.body);
  error && res.status(400).send({
    message: error.details[0].message
  });
  //2-get username from user schema
  const profile = await userModel.findById(req.user._id);
  //createComment
  const comments = await commentModel.create({
    postId: req.body.postId,
    text: req.body.text,
    user: req.user._id,
    //logged In User
    username: profile.username //from user in DB
  });
  res.status(201).json({
    comments
  });
});
/**--------------------------------

* @desc Get  Comments
* @router /api/comments
* @access private (only Admin)
* @method Get
*/
module.exports.getCommentCtrl = asyncHandler(async (req, res) => {
  const comments = await commentModel.find().populate('user');
  res.status(200).json({
    user: comments
  });
});
/**--------------------------------

* @desc Delete  Comment
* @router /api/comments/:id
* @access private (only Admin and user owner)
* @method Delete
*/
module.exports.deleteCommentCtrl = asyncHandler(async (req, res) => {
  const comment = await commentModel.findById(req.params.id);
  !comment && res.status(404).send({
    message: "Comment not found"
  });
  if (req.user.isAdmin || req.user._id === comment.user.toString()) {
    await commentModel.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Comment Deleted",
      comment
    });
  } else {
    res.status(403).json({
      message: "Forbidden!",
      comment
    });
  }
});

/**--------------------------------
 * @desc Update  Comment
 * @router /api/comments/:id
 * @access private(only owner user)
 * @method PUT
 */

module.exports.updateCommentCtrl = asyncHandler(async (req, res) => {
  //1-validation
  const {
    error
  } = validupdateComment(req.body);
  error && res.status(400).send({
    message: error.details[0].message
  });
  //2-get get from DB
  const comment = await commentModel.findById(req.params.id);
  !comment && res.status(404).json({
    message: "Comment Not Found"
  });
  //check user owner if him try to update his comment
  req.user._id !== comment.user.toString() && res.status(403).json({
    message: "Only Owner User for his Comment"
  });
  //update comment
  const updateComment = await commentModel.findByIdAndUpdate(req.params.id, {
    $set: {
      text: req.body.text
    }
  }, {
    new: true
  });
  res.status(201).json({
    updateComment
  });
});