import asyncHandler from 'express-async-handler';
import { commentModel, validcreateComment, validupdateComment } from '../../models/Comments.js';
import { userModel } from '../../models/UserModel.js';

/**--------------------------------
 * @desc Create New Comment
 * @route /api/comments
 * @access private
 * @method POST
 */
export const createCommentCtrl = asyncHandler(async (req, res) => {
    // 1. Validation
    const { error } = validcreateComment(req.body);
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    // 2. Get username from user schema
    const profile = await userModel.findById(req.user._id);

    // 3. Create comment
    const comment = await commentModel.create({
        postId: req.body.postId,
        text: req.body.text,
        user: req.user._id,
        username: profile.username
    });

    res.status(201).json({ comment });
});

/**--------------------------------
 * @desc Get Comments
 * @route /api/comments
 * @access private (only Admin)
 * @method GET
 */
export const getCommentCtrl = asyncHandler(async (req, res) => {
    const comments = await commentModel.find().populate('user');
    res.status(200).json({ comments });
});

/**--------------------------------
 * @desc Delete Comment
 * @route /api/comments/:id
 * @access private (only Admin and user owner)
 * @method DELETE
 */
export const deleteCommentCtrl = asyncHandler(async (req, res) => {
    const comment = await commentModel.findById(req.params.id);

    if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
    }

    if (req.user.isAdmin || req.user._id.toString() === comment.user.toString()) {
        await commentModel.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            message: 'Comment Deleted',
            comment
        });
    }

    return res.status(403).json({
        message: 'Forbidden!',
        comment
    });
});

/**--------------------------------
 * @desc Update Comment
 * @route /api/comments/:id
 * @access private (only owner user)
 * @method PUT
 */
export const updateCommentCtrl = asyncHandler(async (req, res) => {
    // 1. Validation
    const { error } = validupdateComment(req.body);
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }

    // 2. Get comment from DB
    const comment = await commentModel.findById(req.params.id);
    if (!comment) {
        return res.status(404).json({ message: 'Comment Not Found' });
    }

    // 3. Check if user is the owner of the comment
    if (req.user._id.toString() !== comment.user.toString()) {
        return res.status(403).json({
            message: 'Only the owner user can update their comment'
        });
    }

    // 4. Update comment
    const updatedComment = await commentModel.findByIdAndUpdate(req.params.id, {
        $set: {
            text: req.body.text
        }
    }, { new: true });

    res.status(200).json({ updatedComment });
});
