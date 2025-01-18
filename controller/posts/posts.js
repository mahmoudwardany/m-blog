import fs from 'fs';
import path from 'path';
import asyncHandler from 'express-async-handler';
import { cloudinaryUploadImage, cloudinaryRemoveImage } from "../../cloudinary/cloudinary.js";
import { validPost, Post, validUpdatePost } from '../../models/PostModel.js';
import { commentModel } from '../../models/Comments.js';

const imagePath = (filename) => path.join(__dirname, `../../image/${filename}`);

const handleImageUpload = async (file) => {
    if (!file) throw new Error("Image not Provided");
    const image = await cloudinaryUploadImage(imagePath(file.filename));
    return image;
};

const handleDeletePost = async (post) => {
    await cloudinaryRemoveImage(post.image.publicId);
    await commentModel.deleteMany({ postId: post._id });
};

export const createNewPost = asyncHandler(async (req, res) => {
    const { error } = validPost(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const image = await handleImageUpload(req.file);
    const post = await Post.create({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        user: req.user._id,
        image: {
            url: image.secure_url,
            publicId: image.public_id,
        },
    });

    res.status(201).json({ message: "Post Created Successfully", post });
    fs.unlinkSync(imagePath(req.file.filename));
});

export const findPosts = asyncHandler(async (req, res) => {
    const numPerPage = 3;
    const { pageNumber, category } = req.query;
    const filter = category ? { category } : {};

    const posts = await Post.find(filter)
        .skip(pageNumber ? (pageNumber - 1) * numPerPage : 0)
        .limit(numPerPage)
        .sort({ createdAt: -1 })
        .populate("user", ["-password"]);

    res.status(200).json(posts);
});

export const postCount = asyncHandler(async (req, res) => {
    const count = await Post.count();
    res.status(200).json(count);
});

export const findPost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id)
        .populate("user", ["-password"])
        .populate('comments');

    if (!post) return res.status(404).json({ message: "Post Not Found" });

    res.status(200).json({ post });
});

export const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post Not Found" });

    if (req.user.isAdmin || req.user._id.toString() === post.user.toString()) {
        await Post.findByIdAndDelete(req.params.id);
        await handleDeletePost(post);

        res.status(200).json({ message: "Post Deleted", postId: post.image.publicId });
    } else {
        res.status(403).json({ message: "Access Denied" });
    }
});

export const updatePost = asyncHandler(async (req, res) => {
    const { error } = validUpdatePost(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post Not Found" });

    if (req.user._id.toString() !== post.user.toString()) {
        return res.status(403).json({ message: "Access Denied" });
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
        $set: {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category
        }
    }, { new: true }).populate("user", ["-password"]);

    res.status(200).json({ message: "Post Updated", post: updatedPost });
});

export const updatePostImg = asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No File Uploaded" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post Not Found" });

    if (req.user._id.toString() !== post.user.toString()) {
        return res.status(403).json({ message: "Access Denied" });
    }

    await cloudinaryRemoveImage(post.image.publicId);
    const image = await handleImageUpload(req.file);

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
        $set: {
            image: {
                url: image.secure_url,
                publicId: image.public_id
            }
        }
    }, { new: true }).populate("user", ["-password"]);

    res.status(200).json({ message: "Image Updated", updatedPost });
    fs.unlinkSync(imagePath(req.file.filename));
});

export const likeController = asyncHandler(async (req, res) => {
    const { id: postID } = req.params;
    const userLoggedIn = req.user._id;

    let post = await Post.findById(postID);
    if (!post) return res.status(404).json({ message: "Post Not Found" });

    const postLiked = post.likes.includes(userLoggedIn);
    const updateAction = postLiked
        ? { $pull: { likes: userLoggedIn } }
        : { $push: { likes: userLoggedIn } };

    post = await Post.findByIdAndUpdate(postID, updateAction, { new: true });

    res.status(200).json({ post });
});
