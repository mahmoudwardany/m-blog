const asyncHandler = require("express-async-handler")
const { userModel, validUpdateUser } = require("../../models/UserModel")
const bcrypt = require('bcryptjs');
const path = require('path');
const { cloudinaryUploadImage, cloudinaryRemoveImage, cloudianryRemoveMultiImage } = require("../../cloudinary/cloudinary");
const fs = require('fs');
const { commentModel } = require("../../models/Comments");
const { Post } = require("../../models/PostModel");
/**--------------------------------
 * @desc get all user 
 * @router /api/v1/catgory
 * @access public
 * @method GET
 */

module.exports.getAllUser = asyncHandler(async (req, res) => {
   const users = await userModel.find().select("-password")
   res.status(200).json(users)
})
/**--------------------------------
 * @desc get one user 
 * @router /api/users/profile/:id
 * @access public
 * @method GET
 */

module.exports.getUser = asyncHandler(async (req, res) => {
   const user = await userModel.findById(req.params.id).select("-password").populate('posts')
   if (!user) {
      return res.status(404).json({ message: "User Not found" })
   }
      res.status(200).json(user)
})
/**--------------------------------
 * @desc update one user by himself
 * @router /api/users/profile/:id
 * @access private
 * @method Put
 */
module.exports.updateUser = asyncHandler(async (req, res) => {
   const { error } = validUpdateUser(req.body)
   error && res.status(400).json({ message: error.details[0].message })
   const { username, password, bio } = req.body
   //check if password and hash it
   if (password) {
      const salt = await bcrypt.genSalt(10)
      req.body.password = await bcrypt.hash(password, salt)
   }
   //update user
   const updateUser = await userModel.findByIdAndUpdate(req.params.id, {
      $set: {
         username,
         password: req.body.password,
         bio
      }
   }, { new: true }).select("-password").populate('posts')
   res.status(200).json(updateUser)
})

/**--------------------------------
 * @desc get users count 
 * @router /api/users
 * @access private
 * @method GET //only Admin
 */

module.exports.usersCount = asyncHandler(async (req, res) => {
   const count = await userModel.count()
   res.status(200).json(count)
})

/**--------------------------------
 * @desc upload photo
 * @router /profile/upload-photo
 * @access private
 * @method POST
 */
module.exports.uploadPhoto = asyncHandler(async (req, res) => {
   //validation
   if (!req.file) {
      return res.status(400).json({
         message: "No file uploaded"
      })
   }
   //2-get path file
   let pathImage = path.join(__dirname, `../../image/${req.file.filename}`)
   //3-upload to cloudinary
   const result = await cloudinaryUploadImage(pathImage);
   // //4-get user from DB
   const user = await userModel.findById(req.user._id);
   //5-delete old photo
   if (user?.profilePhoto.publicId) {
      await cloudinaryRemoveImage(user?.profilePhoto.publicId)
   }
   // //6-update photo
   user.profilePhoto = {
      url: result?.secure_url,
      publicId: result?.public_id,
   }
   await user.save()
   //7-return photo
   res.status(200).json({
      message: "photo uploaded",
      profilePhoto:{
         url: result?.secure_url,
         publicId: result?.public_id,
      }
   })
   fs.unlinkSync(pathImage)
})

/**--------------------------------
 * @desc Delete User  Profile
 * @router /profile/:id
 * @access User or Admin
 * @method Delete
 */
module.exports.deleteProfileUser = asyncHandler(async (req, res) => {

   //1-get user from DB
   const user = await userModel.findById(req.params.id);
   if (!user) {
      return res.status(400).json({
         message: "User not found"
      })
   }
   //get all posts for user 
   const posts=await Post.find({user:user._id})
   //get ids for posts to remove Multi image for user
   const postsId=posts.map((post)=>post.image.publicId)
  if(postsId?.length > 0){
   await cloudianryRemoveMultiImage(postsId)
  }
   //delete image photo
if(user?.profilePhoto.publicId){
      await cloudinaryRemoveImage(user?.profilePhoto.publicId)
}
   //delete posts and comments
   await commentModel.deleteMany({user:user._id})
   await Post.deleteMany({user:user._id})
   await userModel.findByIdAndDelete(req.params.id)

   res.status(200).json({
      message: "User profile deleted",
      user
   })
})