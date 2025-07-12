// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user')
const testRoutes = require('./routes/test');

// Load environment variables
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // for parsing application/json

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/user', userRoutes);

// Routes placeholder
app.get('/', (req, res) => {
  res.send('PlayBookr API running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
