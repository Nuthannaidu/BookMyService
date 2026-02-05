require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const appointmentRoutes = require('./routes/appointments');

const app = express();


connectDB();

 
app.use(cors({
  origin: [
    "http://localhost:5173",        // local Vite dev
    "https://bookmyservice-1.onrender.com" // deployed frontend
  ],
  credentials: true,
}));

app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);


app.get('/', (req, res) => {
  res.send('Appointment Booking API is running');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
