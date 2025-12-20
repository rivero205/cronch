const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const routes = require('./routes/index');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to CRUNCH API' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
