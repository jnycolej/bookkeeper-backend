// Import MongoClient from the MongoDB library
const { MongoClient } = require('mongodb');
// Load environment variables from the .env file
const dotenv = require('dotenv');

dotenv.config(); // Initialize dotenv to read .env file

// MongoDB connection URI (read from .env or use a default)
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/library';
// Create a new MongoClient instance
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

/**
 * Function to connect to MongoDB
 * - Connects the client
 * - Returns the database instance
 */
async function connectDB() {
    try {
        // Establish a connection to the MongoDB server
        await client.connect();
        console.log('Connected to MongoDB');
        
        // Get the database name from the URI
        const dbName = uri.split('/').pop() || 'library';
        // Return the database instance
        return client.db(dbName);
    } catch (error) {
        // Log and rethrow errors if the connection fails
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

// Export the connectDB function for use in other parts of the application
module.exports = connectDB;
