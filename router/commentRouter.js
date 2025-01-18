import express from 'express';
import { createCommentCtrl, getCommentCtrl, deleteCommentCtrl, updateCommentCtrl } from '../controller/comments/comment.js';
import validObjectId from '../middleware/validObjectId.js';
import { verifyToken, verifyTokenAndAdmin } from '../middleware/verifyToken.js';

const router = express.Router();

router.route('/')
    .post(verifyToken, createCommentCtrl)
    .get(verifyTokenAndAdmin, getCommentCtrl);

router.route('/:id')
    .delete(validObjectId, verifyToken, deleteCommentCtrl)
    .put(validObjectId, verifyToken, updateCommentCtrl);

export default router;
