const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndUserOnly,
  verifyTokenAuthorization
} = require('../middleware/verifyToken');
const validObjectId = require('../middleware/validObjectId');
const photoUpload = require('../middleware/photoupload');
const {
  createNewPost,
  findPosts,
  findPost,
  deletePost,
  updatePost,
  updatePostImg,
  likeController,
  postCount
} = require('../controller/posts/createPost');
const router = require('express').Router();

//Posts
router.route('/').post(verifyToken, photoUpload.single("image"), createNewPost).get(findPosts);

//post count
router.get('/count', postCount);
//post
router.route("/:id").get(validObjectId, findPost).delete(validObjectId, verifyToken, deletePost).put(validObjectId, verifyToken, updatePost);
router.route("/upload-image/:id").put(validObjectId, verifyToken, photoUpload.single("image"), updatePostImg);
router.put('/like/:id', validObjectId, verifyToken, likeController);
module.exports = router;