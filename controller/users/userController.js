import asyncHandler from 'express-async-handler';
import { userModel, validUpdateUser } from '../../models/UserModel';
import bcrypt from 'bcryptjs';
import path from 'path';
import { cloudinaryUploadImage, cloudinaryRemoveImage, cloudianryRemoveMultiImage } from '../../cloudinary/cloudinary';
import fs from 'fs';
import { commentModel } from '../../models/Comments';
import { Post } from '../../models/PostModel';

/**--------------------------------
 * @desc Get all users
 * @router /api/v1/catgory
 * @access public
 * @method GET
 */
export const getAllUser = asyncHandler(async (req, res) => {
   const users = await userModel.find().select('-password');
   res.status(200).json(users);
});

/**--------------------------------
 * @desc Get one user by ID
 * @router /api/users/profile/:id
 * @access public
 * @method GET
 */
export const getUser = asyncHandler(async (req, res) => {
   const user = await userModel.findById(req.params.id).select('-password').populate('posts');
   if (!user) {
      return res.status(404).json({ message: 'User not found' });
   }
   res.status(200).json(user);
});

/**--------------------------------
 * @desc Update user profile
 * @router /api/users/profile/:id
 * @access private
 * @method PUT
 */
export const updateUser = asyncHandler(async (req, res) => {
   const { error } = validUpdateUser(req.body);
   if (error) return res.status(400).json({ message: error.details[0].message });

   const { username, password, bio } = req.body;

   // Hash password if provided
   if (password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(password, salt);
   }

   // Update user
   const updatedUser = await userModel.findByIdAndUpdate(req.params.id, {
      $set: { username, password: req.body.password, bio }
   }, { new: true }).select('-password').populate('posts');

   res.status(200).json(updatedUser);
});

/**--------------------------------
 * @desc Get users count
 * @router /api/users
 * @access private (Admin only)
 * @method GET
 */
export const usersCount = asyncHandler(async (req, res) => {
   const count = await userModel.count();
   res.status(200).json(count);
});

/**--------------------------------
 * @desc Upload profile photo
 * @router /profile/upload-photo
 * @access private
 * @method POST
 */
export const uploadPhoto = asyncHandler(async (req, res) => {
   if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
   }

   const pathImage = path.join(__dirname, `../../image/${req.file.filename}`);

   // Upload to Cloudinary
   const result = await cloudinaryUploadImage(pathImage);

   // Get user from DB
   const user = await userModel.findById(req.user._id);

   // Delete old photo if exists
   if (user?.profilePhoto.publicId) {
      await cloudinaryRemoveImage(user?.profilePhoto.publicId);
   }

   // Update user's profile photo
   user.profilePhoto = {
      url: result?.secure_url,
      publicId: result?.public_id,
   };
   await user.save();

   // Return new photo
   res.status(200).json({
      message: 'Photo uploaded',
      profilePhoto: {
         url: result?.secure_url,
         publicId: result?.public_id,
      }
   });

   // Delete the temporary file from local storage
   fs.unlinkSync(pathImage);
});

/**--------------------------------
 * @desc Delete user profile
 * @router /profile/:id
 * @access User or Admin
 * @method DELETE
 */
export const deleteProfileUser = asyncHandler(async (req, res) => {
   const user = await userModel.findById(req.params.id);
   if (!user) {
      return res.status(400).json({ message: 'User not found' });
   }

   // Get user's posts
   const posts = await Post.find({ user: user._id });
   const postsId = posts.map((post) => post.image.publicId);

   // Remove images from Cloudinary
   if (postsId?.length > 0) {
      await cloudianryRemoveMultiImage(postsId);
   }

   // Remove profile photo from Cloudinary
   if (user?.profilePhoto.publicId) {
      await cloudinaryRemoveImage(user?.profilePhoto.publicId);
   }

   // Delete posts and comments associated with the user
   await commentModel.deleteMany({ user: user._id });
   await Post.deleteMany({ user: user._id });

   // Delete user from DB
   await userModel.findByIdAndDelete(req.params.id);

   res.status(200).json({
      message: 'User profile deleted',
      user
   });
});
