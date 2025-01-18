const {
  createCategoryCtrl,
  getCategoryCtrl,
  deleteCategoryCtrl
} = require('../controller/cateogries/categoryCtrl');
const validObjectId = require('../middleware/validObjectId');
const {
  verifyToken,
  verifyTokenAndAdmin
} = require('../middleware/verifyToken');
const router = require('express').Router();
router.route('/').post(verifyTokenAndAdmin, createCategoryCtrl).get(getCategoryCtrl);
router.route("/:id").delete(validObjectId, verifyTokenAndAdmin, deleteCategoryCtrl);
module.exports = router;