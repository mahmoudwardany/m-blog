import express from 'express';
import { verifyToken } from '../middleware/verifyToken';
import validObjectId from '../middleware/validObjectId';
import photoUpload from '../middleware/photoupload';
import { createNewPost, findPosts, findPost, deletePost, updatePost, updatePostImg, likeController, postCount } from '../controller/posts/posts';

const router = express.Router();

// Posts Routes
router.route('/')
    .post(verifyToken, photoUpload.single('image'), createNewPost)
    .get(findPosts);

// Post Count Route
router.get('/count', postCount);

// Post Routes by ID
router.route('/:id')
    .get(validObjectId, findPost)
    .delete(validObjectId, verifyToken, deletePost)
    .put(validObjectId, verifyToken, updatePost);

// Post Image Upload Route
router.put('/upload-image/:id', validObjectId, verifyToken, photoUpload.single('image'), updatePostImg);

// Like Post Route
router.put('/like/:id', validObjectId, verifyToken, likeController);

export default router;
