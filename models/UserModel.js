const mongoose=require('mongoose')
const joi=require('joi')
const jwt=require('jsonwebtoken')
const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        minLength:3,
        maxLength:100,
        trim:true
    },
    email:{
        type:String,
        required:true,
        minLength:10,
        maxLength:100,
        trim:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minLength:8,
        maxLength:100,
        trim:true
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    bio:String,
    profilePhoto:{
        type:Object,
        default:{
            url:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            publicId:""
        }
    }
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})
//populate posts that belong to user
userSchema.virtual("posts",{
    ref:"Post",
    foreignField:"user",
    localField:"_id"
})
const validRegister=(obj)=>{
const schema=joi.object({
    username:joi.string().min(3).max(100).trim().required(),
    email:joi.string().min(10).max(100).trim().required().email(),
    password:joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,20}$')),
})
return schema.validate(obj)
}
const validLogin=(obj)=>{
const schema=joi.object({
    email:joi.string().min(10).max(100).trim().required().email(),
    password:joi.string().min(8).trim().required(),
})
return schema.validate(obj)
}
const validUpdateUser=(obj)=>{
    const schema=joi.object({
        username:joi.string().min(3).max(100).trim(),
        password:joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,20}$')),
        bio:joi.string()
    })
    return schema.validate(obj)
    }
    //valid email
    const validEmail=(obj)=>{
        const schema=joi.object({
            email:joi.string().required().email(),
        })
        return schema.validate(obj)
        }
        //valid new Password
        const validNewPassword=(obj)=>{
            const schema=joi.object({
                password:joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,20}$')),
            })
            return schema.validate(obj)
            }
userSchema.methods.genrateToken=function(){
    return jwt.sign({_id:this._id,isAdmin:this.isAdmin},process.env.JWT_KEY)
}
const userModel=mongoose.model('User',userSchema)


module.exports={userModel,validRegister,validLogin,validUpdateUser,validEmail,validNewPassword}