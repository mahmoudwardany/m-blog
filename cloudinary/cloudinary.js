const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name:"dtbjywygm",
    api_key:"691581472677386",
    api_secret:"_gGuRNWzkYEJ-v-E00vqFa_6qMQ"
});
const cloudinaryUploadImage=async(fileUpload)=>{
    try {
        const data=await cloudinary.uploader.upload(fileUpload,{
            resource_type:"auto"
        })
        return data
    } catch (error) {
        console.log(error)
        throw new Error("Internal Server Error (cloudinary) ") 
    }
}
//removePhoto
const cloudinaryRemoveImage=async(imagePublicId)=>{
    try {
        const data=await cloudinary.uploader.destroy(imagePublicId)
        return data
    } catch (error) {
        console.log(error)
        throw new Error("Internal Server Error (cloudinary) ") 
    }
}
//removeMultiPhoto
const cloudianryRemoveMultiImage=async(imageIds)=>{
    try {
        const data=await cloudinary.v2.api.delete_all_resources(imageIds)
        return data
    } catch (error) {
        console.log(error)
        throw new Error("Internal Server Error (cloudinary) ") 
    }
}
module.exports={
    cloudinaryUploadImage,
    cloudinaryRemoveImage,
    cloudianryRemoveMultiImage
}
