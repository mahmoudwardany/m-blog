import express from 'express';
import { createCategoryCtrl, getCategoryCtrl, deleteCategoryCtrl } from '../controller/cateogries/categoryCtrl.js'
import validObjectId from '../middleware/validObjectId.js';
import {verifyTokenAndAdmin } from '../middleware/verifyToken.js';

const router = express.Router();

router.route('/')
    .post(verifyTokenAndAdmin, createCategoryCtrl)
    .get(getCategoryCtrl);

router.route('/:id')
    .delete(validObjectId, verifyTokenAndAdmin, deleteCategoryCtrl);

export default router;
