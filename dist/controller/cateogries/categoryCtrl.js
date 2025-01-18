const asyncHandler = require("express-async-handler");
const {
  validCategory,
  categoryModel
} = require("../../models/CategoryModel");

/**--------------------------------
 * @desc Create New Category
 * @router /api/categories
 * @access private (only Admin)
 * @method Post
 */
module.exports.createCategoryCtrl = asyncHandler(async (req, res) => {
  //1-validation
  const {
    error
  } = validCategory(req.body);
  error && res.status(400).send({
    message: error.details[0].message
  });
  //2-create category
  const category = await categoryModel.create({
    title: req.body.title,
    user: req.user._id
  });
  res.status(201).json({
    message: "Category Created Successfully",
    category
  });
});

/**--------------------------------
 * @desc Get All Category
 * @router /api/categories
 * @access public 
 * @method Get
 */
module.exports.getCategoryCtrl = asyncHandler(async (req, res) => {
  const categories = await categoryModel.find();
  res.status(200).json({
    categories
  });
});
/**--------------------------------
 * @desc Delete  Category
 * @router /api/categories/:id
 * @access private 
 * @method Delete
 */
module.exports.deleteCategoryCtrl = asyncHandler(async (req, res) => {
  const category = await categoryModel.findById(req.params.id);
  !category && res.status(404).json({
    message: "Category not found"
  });
  await categoryModel.findByIdAndDelete(req.params.id);
  res.status(200).json({
    message: "Category Deleted",
    categoryId: category._id
  });
});