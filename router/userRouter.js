import express from 'express';
import { getAllUser, getUser, updateUser, usersCount, uploadPhoto, deleteProfileUser } from '../controller/users/userController.js';
import { verifyToken, verifyTokenAndAdmin, verifyTokenAndUserOnly, verifyTokenAuthorization } from '../middleware/verifyToken.js';
import validObjectId from '../middleware/validObjectId.js';
import photoUpload from '../middleware/photoupload.js';

const router = express.Router();

// Get all users and count (Admin only)
router.route('/profile')
    .get(verifyTokenAndAdmin, getAllUser);

router.route('/profile/count')
    .get(verifyTokenAndAdmin, usersCount);

// Upload user profile photo
router.post('/profile/upload-photo', verifyToken, photoUpload.single('image'), uploadPhoto);

// User profile by ID: get, update, delete
router.route('/profile/:id')
    .get(validObjectId, getUser)
    .put(verifyTokenAndUserOnly, updateUser)
    .delete(validObjectId, verifyTokenAuthorization, deleteProfileUser);

export default router;
