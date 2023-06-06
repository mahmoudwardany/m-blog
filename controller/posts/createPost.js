const fs = require('fs')
const path = require("path")
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require("../../cloudinary/cloudinary");
const asyncHandler = require("express-async-handler");
const { validPost, Post, validUpdatePost } = require('../../models/PostModel');
const { commentModel } = require('../../models/Comments');

/**--------------------------------
 * @desc Create New Post
 * @router /api/posts
 * @access private
 * @method Post
 */

module.exports.createNewPost = asyncHandler(async (req, res) => {
    //1-valid if user post image or not
    !req.file && res.status(400).json({ message: "Image not Provided" })
    //2-valid title and description category
    const { error } = validPost(req.body)
    error && res.status(400).json({ message: error.details[0].message })
    //3-upload image from folder image to cloudianry
    const imagePath = path.join(__dirname, `../../image/${req.file.filename}`)
    const result = await cloudinaryUploadImage(imagePath)
    //4-create Post
    const post = await Post.create({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        user: req.user._id,
        image: {
            url: result.secure_url,
            publicId: result.public_id,
        }
    })
    //5-send json to client
    res.status(201).json({
        message: "Post Created Successfully",
        post
    })
    fs.unlinkSync(imagePath)
})
/**--------------------------------
 * @desc Find  Posts
 * @router /api/posts
 * @access public
 * @method GET
 */
/**--------------------------------
 * @desc Get  Posts Count
 * @router /api/posts/count
 * @access public
 * @method GET
 */

module.exports.postCount = asyncHandler(async (req, res) => {
    const count = await Post.count()
    res.status(200).json(count)
 })
 

module.exports.findPosts = asyncHandler(async (req, res) => {
    const numPerPage = 3
    const { pageNumber, category } = req.query
    let posts;
    if (pageNumber) {
        posts = await Post.find()
            .skip((pageNumber - 1) * numPerPage)
            .limit(numPerPage)
            .sort({ createdAt: -1 })
            .populate("user", ["-password"])

    } else if (category) {
        posts = await Post.find({ category }).sort({ createdAt: -1 })
            .populate("user", ["-password"])
    } else {
        posts = await Post.find().sort({ createdAt: -1 })
            .populate("user", ["-password"])

    }
    res.status(200).json(posts)
})
/**--------------------------------
 * @desc Find  Post
 * @router /api/posts/:id
 * @access public
 * @method GET
 */



module.exports.findPost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id)
        .populate("user", ["-password"])
        .populate('comments')
    !post && res.status(404).json({
        message: "Post Not Found"
    })
    res.status(200).json({
        post
    })
})
/**--------------------------------
 * @desc Delete  Post
 * @router /api/posts/:id
 * @access private 
 * @method Delete
 */

module.exports.deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id)
    !post && res.status(404).json({
        message: "Post Not Found"
    });
    if (req.user.isAdmin || req.user._id === post.user.toString()) {
        await Post.findByIdAndDelete(req.params.id)
        await cloudinaryRemoveImage(post.image.publicId)
        await commentModel.deleteMany({postId:post._id})
        res.status(200).json({
            message: "Post Deleted",
            postId: post.image.publicId
        })
    } else {
        res.status(403).json({
            message: "access denied,forbidden"
        })
    }
})
/**--------------------------------
 * @desc Update  Post
 * @router /api/posts/:id
 * @access private
 * @method Put
 */

module.exports.updatePost = asyncHandler(async (req, res) => {
    //1-validation updatePost
    const { error } = validUpdatePost(req.body)
    error && res.status(400).json({ message: error.details[0].message })
    //2-check if post in DB
    const post = await Post.findById(req.params.id)
    !post && res.status(404).json({
        message: "Post Not Found"
    })
    //3-check if user belong to this post or Not
    if (req.user._id !== post.user.toString()) {
        res.status(403).json({
            message: "access denied,forbidden"
        })
    }
    //4-update post
    const updatePost = await Post.findByIdAndUpdate(req.params.id, {
        $set: {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category
        }
    }, { new: true }).populate("user", ["-password"])
    res.status(200).json({
        message: "Post Updated",
        post: updatePost
    })
})
/**--------------------------------
 * @desc Update  Post
 * @router /api/posts/upload-image/:id
 * @access private
 * @method Put
 */


module.exports.updatePostImg = asyncHandler(async (req, res) => {
    //1-validation img
    !req.file && res.status(400).json({
        message: "No File Uploaded"
    })
    //2-check if post in DB
    const post = await Post.findById(req.params.id)
    !post && res.status(404).json({
        message: "Post Not Found"
    })
    //3-check if user belong to this post or Not
    if (req.user._id !== post.user.toString()) {
        res.status(403).json({
            message: "access denied,forbidden"
        })
    }
    //4-delete old image
    await cloudinaryRemoveImage(post.image.publicId)

    //5-upload New Image
    const imgpath = path.join(__dirname, `../../image/${req.file.filename}`)
    const image = await cloudinaryUploadImage(imgpath)
    //6-Update Image in DB
    const updateImg = await Post.findByIdAndUpdate(req.params.id, {
        $set: {
            image: {
                url: image.secure_url,
                publicId: image.public_id,
            }
        }
    }, { new: true }).populate("user", ["-password"])
    res.status(200).json({
        message: "Image Updated",
        updateImg
    })
    fs.unlinkSync(imgpath)
})

/**--------------------------------
 * @desc Like  Post
 * @router /api/posts/like/:id
 * @access public
 * @method Put
 */

module.exports.likeController = asyncHandler(async (req, res) => {
    //1-user id who want to like
    const userLoggedIn = req.user._id
    //2-post id
    const { id: postID } = req.params
    //3-check if post in DB
    let post = await Post.findById(postID)
    !post && res.status(404).json({
        message: "Post Not Found"
    })
    //4-check if user already like this post
    const postLiked = post.likes.find(like => like.toString() === userLoggedIn)
    if (postLiked) {
        //5-remove user from likes
        post = await Post.findByIdAndUpdate(postID, {
            $pull: { likes: userLoggedIn }
        }, { new: true })
    }else{
       //6-add user to likes
        post = await Post.findByIdAndUpdate(postID, {
            $push: { likes: userLoggedIn }
        }, { new: true }) 
    }  
    res.status(200).json({
        post
    })
})