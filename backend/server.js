const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const rateLimit = require('express-rate-limit'); // <-- IMPORT RATE LIMITER
require('dotenv').config();

const app = express();

// Connect to Database
connectDB();

// --- SECURITY: Apply Rate Limiting to Auth routes ---
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 requests per windowMs
	standardHeaders: true,
	legacyHeaders: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
});

app.use('/api/auth', authLimiter); // Apply the limiter to all routes in authRoutes.js
// --- END SECURITY ---

// Initialize Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Define API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/records',require('./routes/medicalRecordRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Simple test route
app.get('/', (req, res) => res.send('MediDesk API is Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Backend server started on port ${PORT}`));