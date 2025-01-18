const express = require('express');
const connectDB = require('./config/connectDB');
const { notFound, handleError } = require('./middleware/errorhandler');
const app = express();
const xss = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

// Connect to the database
connectDB();

// Middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(compression());

app.use(cors({
  origin: '*'
}));

// Prevent XSS
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
});
app.use(limiter);

// Security Headers with Helmet
app.use(helmet());

// Prevent HTTP Param Pollution
app.use(hpp());

// Define root route
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

// Routes
app.use('/api/auth', require('./router/authRouter'));
app.use('/api/users', require('./router/userRouter'));
app.use('/api/posts', require('./router/postRouter'));
app.use('/api/comments', require('./router/commentRouter'));
app.use('/api/categories', require('./router/categoryRoute'));
app.use('/api/password', require('./router/password'));

// Error handling
app.use(notFound);
app.use(handleError);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App is running in ${process.env.NODE_ENV} mode on port ${port}`);
});
