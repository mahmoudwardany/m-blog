const express= require('express')
const connectDB = require('./config/connectDB')
const { notFound, handleError } = require('./middleware/errorhandler')
const app=express()
const xxs=require('xss-clean')
const helmet=require('helmet')
const hpp=require('hpp')
const rateLimit = require('express-rate-limit')
const morgan=require('morgan')
const cors=require('cors')
const compression=require("compression")
require('dotenv').config()

//connect db
connectDB()


const port=process.env.PORT || 8000



//middleware
app.use(express.json())
app.use(morgan('tiny'))
app.use(compression())
const allowedOrigins = ['http://localhost:3000', 'https://m-blog7.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
//prevent xxs
app.use(xxs())
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 200, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
})
// Apply the rate limiting middleware to all requests
app.use(limiter)
// //Secruity Headers helmet
app.use(helmet())
//prevent HTTP Param Pollution
app.use(hpp())

//router
app.use('/api/auth',require('./router/authRouter'))
app.use('/api/users',require('./router/userRouter'))
app.use('/api/posts',require('./router/postRouter'))
app.use('/api/comments',require('./router/commentRouter'))
app.use('/api/categories',require('./router/categoryRoute'))
app.use('/api/password',require('./router/password'))

//handle error
app.use(notFound)
app.use(handleError)


app.listen(port,()=>{
    console.log(`app is running in ${process.env.NODE_ENV} Mode at port ${port}`)
})