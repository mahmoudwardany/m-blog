const asyncHandler=require("express-async-handler")
const { validLogin, userModel } = require("../../models/UserModel")
const bcrypt=require('bcryptjs');

/**--------------------------------
 * @desc Login 
 * @router /api/v1/auth/login
 * @access public
 * @method POST
 */

module.exports.userLogin=asyncHandler(async(req,res)=>{
    //email and password
    const{email,password}=req.body;
    //check if email and password are valid
    const{error}=validLogin({email,password})
    error&&res.status(400).send({message:error.details[0].message})

    //check if user exists
    const user=await userModel.findOne({email})
    !user&&res.status(400).send({message:"Email or password are unvalid"})
    //check password
    const checkPassword = bcrypt.compare(password,user.password)
    !checkPassword&&res.status(400).send({message:"Email or password are unvalid"})
    //generate token
const token = user.genrateToken()
    //send json to user
    res.status(200).send({
        _id:user._id,
        imageProfile:user.imageProfile,
        isAdmin:user.isAdmin,
        token
    })
})