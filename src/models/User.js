const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
  auth0Id: {type: String, unique: true},
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true},  
  displayName: { type: String},
  preferences: {
    genres: [String],
    authors: [String],
    formats: [String]
  },
  readingGoals: {
    booksPerYear: Number
  },
  history: [{
    book: {type: ObjectId, ref: 'Book'},
    date: Date
  }]
}, {timestamps: true});

const User = mongoose.model('User', userSchema);
module.exports = User;
