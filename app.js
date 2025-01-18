import express from 'express';
import connectDB from './config/connectDB';
import { notFound, handleError } from './middleware/errorhandler';
import xss from 'xss-clean';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';

dotenv.config();

// Initialize app
const app = express();

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
import authRouter from './router/authRouter';
import userRouter from './router/userRouter';
import postRouter from './router/postRouter';
import commentRouter from './router/commentRouter';
import categoryRoute from './router/categoryRoute';
import passwordRouter from './router/password';

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/categories', categoryRoute);
app.use('/api/password', passwordRouter);

// Error handling
app.use(notFound);
app.use(handleError);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App is running in ${process.env.NODE_ENV} mode on port ${port}`);
});
