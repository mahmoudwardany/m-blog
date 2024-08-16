const asyncHandler = require("express-async-handler")
const { validLogin, userModel, validRegister } = require("../../models/UserModel")
const bcrypt = require('bcryptjs');
const { verificationModel } = require("../../models/verificationToken");
const crypto = require('crypto')
const sendEmail = require('../../utils/sendEmail')
/**--------------------------------
 * @desc Register New User
 * @router /api/v1/auth/register
 * @access public
 * @method POST
 */

module.exports.registerController = asyncHandler(async (req, res) => {
    //validte
    const { error } = validRegister(req.body)
    error && res.status(400).send({ message: error.details[0].message })
    //check if email exsits
    const emailExsits = await userModel.findOne({ email: req.body.email })
    emailExsits && res.status(400).send({ message: "Email Already Exists" })
    //hash password
    const salt = await bcrypt.genSalt(8)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    //save user 
    const newUser = await new userModel({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
    }).save()
    //creatin verificationToken & save in DB
    const verificationToken = await new verificationModel({
        userId: newUser?._id,
        token: crypto.randomBytes(32).toString("hex")
    }).save()

    //Making the link
    const link = `${process.env.CLIENT_DOMAIN}/user/${newUser?._id}/verify/${verificationToken.token}`
    //putting link in html 
    const htmlTemplete = `
    <div>
    <p>Click here to verify your Email </p>
    <a href="${link}" >Verify</a>
    </div>
    `
    //send email
    await sendEmail(newUser.email, "verify your email", htmlTemplete)
    //send json
    res.status(201).json({ message: "We Sent to you an email.please Check it and verify your email address" })
})
/**--------------------------------
 * @desc Login 
 * @router /api/v1/auth/login
 * @access public
 * @method POST
 */

module.exports.userLogin = asyncHandler(async (req, res) => {
    //email and password
    const { email, password } = req.body;
    //check if email and password are valid
    const { error } = validLogin({ email, password })
    error && res.status(400).send({ message: error.details[0].message })

    //check if user exists
    const user = await userModel.findOne({ email })
    !user && res.status(400).send({ message: "Email or password are Invalid" })
    //check password
    const checkPassword = await bcrypt.compare(password, user.password)
    !checkPassword && res.status(400).send({ message: "Email or password are Invalid" })
    if (!user.isVerified) {
        let verifcationToken = await verificationModel.findOne({
            userId: user._id
        })
        if (!verifcationToken) {
            verifcationToken = await new verificationModel({
                userId: newUser?._id,
                token: crypto.randomBytes(32).toString("hex")
            }).save()

            //Making the link
            const link = `${process.env.CLIENT_DOMAIN}/user/${newUser?._id}/verify/${verifcationToken.token}`
            //putting link in html 
            const htmlTemplete = `
            <div>
            <p>Click here to verify your Email </p>
            <a href="${link}" >Verify</a>
            </div>
            `
            //send email
            await sendEmail(newUser.email, "verify your email", htmlTemplete)
            return res.status(400).json({ message: "We Sent to you an email.please Check it and verify your email address" })
        }

    }
    //generate token
    const token = user.genrateToken()
    //send json to user
    res.status(200).send({
        _id: user._id,
        profilePhoto: user.profilePhoto,
        isAdmin: user.isAdmin,
        token,
        username: user.username,
        message: "Login Successfully"
    })
})
/**--------------------------------
 * @desc Verify 
 * @router /api/v1/auth/:userId/verify/:token
 * @access public
 * @method Get
 */

module.exports.verifyAccountCtrl = asyncHandler(async (req, res) => {
    //check user 
    const user = await userModel.findById(req.params.userId)
    if (!user) {
        return res.status(400).json({
            message: "invalid link"
        })
    }
    //check verifcation token
    const verificationToken = await verificationModel.findOne({
        userId: user._id,
        token: req.params.token
    })
    if (!verificationToken) {
        return res.status(400).json({
            message: "invalid link"
        })
    }

    user.isVerified = true;
    await user.save();
    await verificationToken.deleteOne()
    res.status(200).json({
        message: "Account Verified Successfully"
    })
})

