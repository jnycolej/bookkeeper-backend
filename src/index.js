// Imports
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
const { checkJwt, attachUser } = require('./middleware/auth');

dotenv.config(); // Initialize dotenv to read .env file

// Initialize an Express application
const app = express();

//Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/library';

const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
};
// Enable CORS for front-end origin (and allow preflight)
app.use(cors(corsOptions));
// Handle OPTIONS preflight for all routes
app.options('*', cors(corsOptions));

//JSON parser
app.use(express.json());

app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

//Mount API routes
app.use(
    '/api/books', 
    checkJwt,
    attachUser,
    bookRoutes
);

app.use(
    '/api/users',
    checkJwt,
    attachUser,
    userRoutes
);

// at the very bottom of index.js, before connecting to Mongo
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(err.status || 500).json({ error: err.message });
});

//Connect to Mongo
mongoose
    .connect(MONGO_URI)
    .then(() => { console.log("MongoDB connected");
        app.listen(PORT, () => 
        console.log(`Server listening on port ${PORT}`)
    );
    })
    .catch((err) => {
        console.error('MongoDDB connection error',err);
        process.exit(1);
    });
