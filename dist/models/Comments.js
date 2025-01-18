const mongoose = require('mongoose');
const joi = require("joi");
const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  }
});
const commentModel = mongoose.model('Comment', commentSchema);
function validcreateComment(obj) {
  const schema = joi.object({
    postId: joi.string().required(),
    text: joi.string().trim().required()
  });
  return schema.validate(obj);
}
function validupdateComment(obj) {
  const schema = joi.object({
    text: joi.string().trim().required()
  });
  return schema.validate(obj);
}
module.exports = {
  commentModel,
  validcreateComment,
  validupdateComment
};