const mongoose = require('mongoose');
const joi = require('joi');
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    minLength: 3,
    maxLength: 200
  },
  description: {
    type: String,
    trim: true,
    required: true,
    minLength: 10
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: Object,
    default: {
      url: "",
      publicId: ""
    }
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});
postSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "postId",
  localField: "_id"
});
const Post = mongoose.model("Post", postSchema);
const validPost = obj => {
  const schema = joi.object({
    title: joi.string().min(3).max(100).trim().required(),
    description: joi.string().min(10).trim().required(),
    category: joi.string().trim().required()
  });
  return schema.validate(obj);
};
const validUpdatePost = obj => {
  const schema = joi.object({
    title: joi.string().min(3).max(200).trim(),
    description: joi.string().min(10).trim(),
    category: joi.string().trim()
  });
  return schema.validate(obj);
};
module.exports = {
  Post,
  validPost,
  validUpdatePost
};