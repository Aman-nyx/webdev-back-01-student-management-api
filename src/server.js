require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const studentRoutes = require('./routes/students');
const facultyRoutes = require('./routes/faculties');
const courseRoutes = require('./routes/courses');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Connect to database
connectDB().catch((err) => {
  console.error('Failed to connect to database:', err);
});

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/courses', courseRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Student Management API',
    endpoints: {
      students: '/api/students',
      docs: '/api/docs',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
