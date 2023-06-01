const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name:"dtbjywygm",
    api_key:"691581472677386",
    api_secret:process.env.API_SECRET
  });
  
const cloudinaryUploadImage=async(fileUpload)=>{
    try {
        const data=await cloudinary.uploader.upload(fileUpload,{
            resource_type:"auto"
        })
        return data
    } catch (error) {
        return error
    }
}
//removePhoto
const cloudinaryRemoveImage=async(imagePublicId)=>{
    try {
        const data=await cloudinary.uploader.destroy(imagePublicId)
        return data
    } catch (error) {
        return error
    }
}
//removeMultiPhoto
const cloudianryRemoveMultiImage=async(imageIds)=>{
    try {
        const data=await cloudinary.v2.api.delete_all_resources(imageIds)
        return data
    } catch (error) {
        return error
    }
}
module.exports={
    cloudinaryUploadImage,
    cloudinaryRemoveImage,
    cloudianryRemoveMultiImage
}
