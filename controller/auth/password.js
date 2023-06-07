const asyncHandler=require("express-async-handler")
const { validNewPassword, userModel, validEmail} = require("../../models/UserModel")
const bcrypt=require('bcryptjs');
const { verificationModel } = require("../../models/verificationToken");
const crypto=require('crypto')
const sendEmail=require('../../utils/sendEmail')



//valid email
/**--------------------------------
 * @desc Reset Password
 * @router /api/password/reset-password-link
 * @access public
 * @method POST
 */

//user want to make verification token to reset password
module.exports.sendResetPassword=asyncHandler(async(req,res)=>{
//validation
const {error}=validEmail(req.body)
error&&res.status(400).json({message:error.details[0].message})
//get user email from DB
const user=await userModel.findOne({email:req.body.email})
!user&&res.status(404).json({message:"Email Not Found"})

//verifaction token
let verificationToken=await verificationModel.findOne({userId:user._id})
if(!verificationToken){
    verificationToken= new verificationModel({
    userId:user._id,
    token:crypto.randomBytes(32).toString("hex")
})
await verificationToken.save()
}

//Creating Link
const link=`${process.env.CLIENT_DOMAIN}/reset-password/${user._id}/${verificationToken.token}`

//creating html templete
const htmlTemplete=`
<div>
<p>Click here to Reset your Password </p>
<a href="${link}" >Verify</a>
</div>
`
await sendEmail(user.email,"Reset password",htmlTemplete)
res.status(200).json({
    message:"Password reset link send to your email.Please Check your Spam Message!"
})

})

/**--------------------------------
 * @desc Get reset Password
 * @router /api/password/reset-password/:userId/:token
 * @access public
 * @method GET  
 */

module.exports.getResetPassword=asyncHandler(async(req,res)=>{
const user = await userModel.findById(req.params.userId)
!user&&res.status(404).json({
    message:"invalid link"
})
const verificationToken = await verificationModel.findOne({
    userId:user._id,
    token:req.params.token
})
!verificationToken&&res.status(404).json({
    message:"invalid link"
})
res.status(200).json({
    message:"Valid url"
})
})

//create new password
/**--------------------------------
 * @desc  reset Password
 * @router /api/password/reset-password/:userId/:token
 * @access public
 * @method Post  
 */
module.exports.resetPasswordCtrl=asyncHandler(async(req,res)=>{
//validation
const {error}=validNewPassword(req.body)
error&&res.status(400).json({message:error.details[0].message})
//get user email from DB
const user=await userModel.findById(req.params.userId)
!user&&res.status(400).json({message:"Email Not Found"})
//check verifcationToken
const verificationToken = await verificationModel.findOne({
    userId:user._id,
    token:req.params.token
})
!verificationToken&&res.status(404).json({
    message:"invalid link"
})
if(!user.isVerified){
    user.isVerified=true
}
//create new password
const salt=await bcrypt.genSalt(10)
const hashedPassword=await bcrypt.hash(req.body.password,salt)
//update password
user.password=hashedPassword
await user.save()
//delete verification token
await verificationToken.deleteOne()
res.status(201).json({
    message:"Password reset Successfully.Please Log in"
})

})