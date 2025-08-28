require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter, helmetConfig } = require('./middleware/security');

const app = express();
const path = require('path');

// Security middleware
app.use(helmetConfig);
app.use(apiLimiter);

// CORS configuration - restrict to your frontend domain in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] // Replace with your actual frontend URL
    : ['http://localhost:3000', 'http://127.0.0.1:3000'], // Local development
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(logger);

// health route
app.use('/api', require('./routes/health.routes'));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to TaskSphere API 🚀' });
});

app.use('/api/users', require('./routes/user.routes'));

app.use('/api/tasks', require('./routes/task.routes'));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/activity', require('./routes/activity.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// Error handling middleware (must be after all routes)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
