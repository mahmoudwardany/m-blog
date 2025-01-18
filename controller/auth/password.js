import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { validNewPassword, userModel, validEmail } from "../../models/UserModel.js";
import { verificationModel } from "../../models/verificationToken.js";
import sendEmail from "../../utils/sendEmail.js";

// Destructure environment variables
const { CLIENT_DOMAIN } = process.env;

/**--------------------------------
 * @desc Reset Password - Send Reset Password Link
 * @route POST /api/password/reset-password-link
 * @access Public
 */
export const sendResetPassword = asyncHandler(async (req, res) => {
    // Validate email input
    const { error } = validEmail(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Find user by email
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "Email Not Found" });

    // Find or create a verification token
    let verificationToken = await verificationModel.findOne({ userId: user._id });
    if (!verificationToken) {
        verificationToken = new verificationModel({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
        });
        await verificationToken.save();
    }

    // Create password reset link
    const link = `${CLIENT_DOMAIN}/reset-password/${user._id}/${verificationToken.token}`;

    // Create HTML email template
    const htmlTemplate = `
    <div>
      <p>Click here to reset your password:</p>
      <a href="${link}">Reset Password</a>
    </div>
  `;

    // Send the email
    await sendEmail(user.email, "Reset Password", htmlTemplate);

    res.status(200).json({
        message: "Password reset link sent to your email. Please check your spam folder if you don't see it!",
    });
});

/**--------------------------------
 * @desc Get Reset Password - Validate URL
 * @route GET /api/password/reset-password/:userId/:token
 * @access Public
 */
export const getResetPassword = asyncHandler(async (req, res) => {
    const { userId, token } = req.params;

    // Verify user and token
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "Invalid link" });

    const verificationToken = await verificationModel.findOne({ userId: user._id, token });
    if (!verificationToken) return res.status(404).json({ message: "Invalid link" });

    res.status(200).json({ message: "Valid URL" });
});

/**--------------------------------
 * @desc Reset Password - Update Password
 * @route POST /api/password/reset-password/:userId/:token
 * @access Public
 */
export const resetPasswordCtrl = asyncHandler(async (req, res) => {
    const { userId, token } = req.params;

    // Validate new password input
    const { error } = validNewPassword(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Verify user and token
    const user = await userModel.findById(userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    const verificationToken = await verificationModel.findOne({ userId: user._id, token });
    if (!verificationToken) return res.status(404).json({ message: "Invalid link" });

    // Mark user as verified if not already
    if (!user.isVerified) user.isVerified = true;

    // Hash and update the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    await user.save();

    // Delete the verification token
    await verificationToken.deleteOne();

    res.status(201).json({
        message: "Password reset successfully. Please log in.",
    });
});
