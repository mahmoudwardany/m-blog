const { userLogin } = require('../controller/auth/login')
const { registerController } = require('../controller/auth/register')

const router=require('express').Router()


router.post('/register',registerController)
router.post('/login',userLogin)



module.exports=router