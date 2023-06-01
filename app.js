const express= require('express')
const connectDB = require('./config/connectDB')
const { notFound, handleError } = require('./middleware/errorhandler')
const app=express()
require('dotenv').config()

//connect db
connectDB()


const port=process.env.PORT || 8000



//middleware
app.use(express.json())

//router
app.use('/api/auth',require('./router/authRouter'))
app.use('/api/users',require('./router/userRouter'))
app.use('/api/posts',require('./router/postRouter'))
app.use('/api/comments',require('./router/commentRouter'))
app.use('/api/categories',require('./router/categoryRoute'))

//handle error
app.use(notFound)
app.use(handleError)


app.listen(port,()=>{
    console.log(`app is running in ${process.env.NODE_ENV} Mode at port ${port}`)
})