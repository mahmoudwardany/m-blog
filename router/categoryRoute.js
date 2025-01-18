import express from 'express';
import { createCategoryCtrl, getCategoryCtrl, deleteCategoryCtrl } from '../controller/categories/categoryCtrl';
import validObjectId from '../middleware/validObjectId';
import {verifyTokenAndAdmin } from '../middleware/verifyToken';

const router = express.Router();

router.route('/')
    .post(verifyTokenAndAdmin, createCategoryCtrl)
    .get(getCategoryCtrl);

router.route('/:id')
    .delete(validObjectId, verifyTokenAndAdmin, deleteCategoryCtrl);

export default router;
