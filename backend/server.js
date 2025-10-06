const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Connect to Database
connectDB();

// Initialize Middleware
app.use(cors()); // Allows requests from our frontend
app.use(express.json({ extended: false })); // Allows us to accept JSON data in request bodies

// Define API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/records', require('./routes/medicalRecordRoutes'));

// Simple test route
app.get('/', (req, res) => res.send('MediDesk API is Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Backend server started on port ${PORT}`));