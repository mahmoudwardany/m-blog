import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { verificationModel } from "../../models/verificationToken.js";
import sendEmail from "../../utils/sendEmail.js";
import { validLogin, validRegister, userModel } from "../../models/UserModel.js";

/**
 * @desc Register New User
 * @route POST /api/v1/auth/register
 * @access Public
 */
export const registerController = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // Validate input
    const { error } = validRegister(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Check if email exists
    const emailExists = await userModel.findOne({ email });
    if (emailExists) return res.status(400).json({ message: "Email Already Exists" });

    // Hash password
    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const newUser = await userModel.create({
        username,
        email,
        password: hashedPassword,
    });

    // Create verification token
    const verificationToken = await verificationModel.create({
        userId: newUser._id,
        token: crypto.randomBytes(32).toString("hex"),
    });

    // Create verification link
    const link = `${process.env.CLIENT_DOMAIN}/user/${newUser._id}/verify/${verificationToken.token}`;

    // Email template
    const htmlTemplate = `
        <div>
            <p>Click here to verify your Email:</p>
            <a href="${link}">Verify</a>
        </div>
    `;

    // Send email
    await sendEmail(newUser.email, "Verify your email", htmlTemplate);

    res.status(201).json({ message: "We sent you an email. Please check it and verify your email address." });
});

/**
 * @desc Login User
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const userLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    const { error } = validLogin({ email, password });
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email or password are invalid" });

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Email or password are invalid" });

    // Check if user is verified
    if (!user.isVerified) {
        let verificationToken = await verificationModel.findOne({ userId: user._id });

        if (!verificationToken) {
            verificationToken = await verificationModel.create({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            });

            const link = `${process.env.CLIENT_DOMAIN}/user/${user._id}/verify/${verificationToken.token}`;
            const htmlTemplate = `
                <div>
                    <p>Click here to verify your Email:</p>
                    <a href="${link}">Verify</a>
                </div>
            `;
            await sendEmail(user.email, "Verify your email", htmlTemplate);
        }

        return res.status(400).json({ message: "We sent you an email. Please check it and verify your email address." });
    }

    // Generate token
    const token = user.generateToken();

    res.status(200).json({
        _id: user._id,
        profilePhoto: user.profilePhoto,
        isAdmin: user.isAdmin,
        token,
        username: user.username,
        message: "Login successful",
    });
});

/**
 * @desc Verify User Account
 * @route GET /api/v1/auth/:userId/verify/:token
 * @access Public
 */
export const verifyAccountCtrl = asyncHandler(async (req, res) => {
    const { userId, token } = req.params;

    // Check user
    const user = await userModel.findById(userId);
    if (!user) return res.status(400).json({ message: "Invalid link" });

    // Check verification token
    const verificationToken = await verificationModel.findOne({ userId: user._id, token });
    if (!verificationToken) return res.status(400).json({ message: "Invalid link" });

    // Verify user
    user.isVerified = true;
    await user.save();
    await verificationToken.deleteOne();

    res.status(200).json({ message: "Account verified successfully" });
});
