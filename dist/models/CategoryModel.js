const mongoose = require('mongoose');
const joi = require("joi");
const categorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  }
});
const categoryModel = mongoose.model('category', categorySchema);
function validCategory(obj) {
  const schema = joi.object({
    title: joi.string().trim().required()
  });
  return schema.validate(obj);
}
module.exports = {
  categoryModel,
  validCategory
};