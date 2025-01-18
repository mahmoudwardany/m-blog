import asyncHandler from 'express-async-handler';
import { validCategory, categoryModel } from '../../models/CategoryModel.js';

/**--------------------------------
 * @desc Create New Category
 * @route /api/categories
 * @access private (only Admin)
 * @method POST
 */
export const createCategoryCtrl = asyncHandler(async (req, res) => {
    // 1. Validation
    const { error } = validCategory(req.body);
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    // 2. Create category
    const category = await categoryModel.create({
        title: req.body.title,
        user: req.user._id
    });

    res.status(201).json({
        message: 'Category Created Successfully',
        category
    });
});

/**--------------------------------
 * @desc Get All Categories
 * @route /api/categories
 * @access public 
 * @method GET
 */
export const getCategoryCtrl = asyncHandler(async (req, res) => {
    const categories = await categoryModel.find();
    res.status(200).json({ categories });
});

/**--------------------------------
 * @desc Delete Category
 * @route /api/categories/:id
 * @access private
 * @method DELETE
 */
export const deleteCategoryCtrl = asyncHandler(async (req, res) => {
    const category = await categoryModel.findById(req.params.id);

    if (!category) {
        return res.status(404).json({
            message: 'Category not found'
        });
    }

    await categoryModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
        message: 'Category Deleted',
        categoryId: category._id
    });
});
