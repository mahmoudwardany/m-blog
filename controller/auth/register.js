const asyncHandler=require("express-async-handler")
const { validRegister, userModel } = require("../../models/UserModel")
const bcrypt=require('bcryptjs')

/**--------------------------------
 * @desc Register New User
 * @router /api/v1/auth/register
 * @access public
 * @method POST
 */

module.exports.registerController=asyncHandler(async(req,res)=>{
    //validte
    const {error}=validRegister(req.body)
    error&&res.status(400).send({message:error.details[0].message})
    //check if email exsits
    const emailExsits=await userModel.findOne({email:req.body.email})
    emailExsits&&res.status(400).send({message:"Email Already Exists"})
    //hash password
    const salt =await bcrypt.genSalt(8)
    const hashedPassword=await bcrypt.hash(req.body.password,salt)
    //save user 
    const newUser=await new userModel({
        username:req.body.username,
        email:req.body.email,
        password:hashedPassword,
    }).save()
    //send json
    res.status(201).send({message:"User Register Succefully",success:true,newUser})
})