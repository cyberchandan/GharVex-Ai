const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
const app = express();

// Database initialization
connectDB();

// Middleware to ensure DB is connected before any request is processed
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ 
      message: 'Database connection error. Please ensure MONGO_URI is set in Vercel environment variables and the IP address is whitelisted in MongoDB Atlas.',
      error: error.message 
    });
  }
});

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use(morgan('dev'));

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('AI Smart Contractor API is running...');
});

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
