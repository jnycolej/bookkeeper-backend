const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: [{ type: String, required: true }],
  genres: [{ type: String }],
  pageCount: {type: Number, default: null},
  publicationYear: {type: Number, default: null},
  status: {
    type: String,
    enum: ['read', 'currentlyReading', 'owned', 'want'],
    default: 'want',
  },
  format: {type: String, enum: ['physical', 'ebook', 'library'], default: null},
  series: { type: String, default: null},
  rating: {type: Number, default: null},
  dateAdded: {type: Date, default: Date.now},
  dateFinished: {type: Date, default: null},
  isbn10: {type: String, default: null},
  isbn13: {type: String, default: null},
  owner: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
  },
}, {timestamps: true});

bookSchema.index({owner: 1});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
