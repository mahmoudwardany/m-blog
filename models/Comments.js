import mongoose from 'mongoose';
import joi from 'joi';

const commentSchema = new mongoose.Schema(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const commentModel = mongoose.model('Comment', commentSchema);

const validcreateComment = (obj) => {
    const schema = joi.object({
        postId: joi.string().required(),
        text: joi.string().trim().required(),
    });
    return schema.validate(obj);
};

const validupdateComment = (obj) => {
    const schema = joi.object({
        text: joi.string().trim().required(),
    });
    return schema.validate(obj);
};

export { commentModel, validcreateComment, validupdateComment };
