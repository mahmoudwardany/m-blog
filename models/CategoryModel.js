import mongoose from 'mongoose';
import joi from 'joi';

const categorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const categoryModel = mongoose.model('category', categorySchema);

const validCategory = (obj) => {
    const schema = joi.object({
        title: joi.string().trim().required(),
    });
    return schema.validate(obj);
};

export { categoryModel, validCategory };
