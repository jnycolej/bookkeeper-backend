// Import required modules
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');   // Allows servers to access resources
const mongoose = require('mongoose');

dotenv.config(); // Initialize dotenv to read .env file

//const bookRoutes = require('./routes/bookRoutes');
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/library';

//Connects to the MongoDB database
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

const bookRoutes = require('./routes/bookRoutes');

// Initialize an Express application
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

async function startServer() {
    try {
        // Use your routes
        app.use('/books', bookRoutes);

        app.get('/test-connection', async (req, res) => {
            try {
                const db = mongoose.connection.db;
                const databasesList = await db.admin().listDatabases();
                res.json(databasesList);
            } catch (error) {
                console.error('Error testing database connection:', error);
                res.status(500).json({ error: 'Database connection test failed' });
            }
        });

        // Start the server and listen on all network interfaces
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

startServer();
