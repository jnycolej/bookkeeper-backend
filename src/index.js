// Import required modules
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');   // Allows servers to access resources
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');

dotenv.config(); // Initialize dotenv to read .env file

// Initialize an Express application
const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5000;

//const bookRoutes = require('./routes/bookRoutes');
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/library';

// //Connects to the MongoDB database
// mongoose.connect(mongoURI)
//     .then(() => console.log('MongoDB connected'))
//     .catch(err => console.error('Error connecting to MongoDB:', err));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
    })
    .catch(err => console.error(err));
    
const bookRoutes = require('./routes/bookRoutes');


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
