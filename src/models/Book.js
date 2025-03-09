const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: [{ type: String, required: true }],
  genres: [{ type: String }],
  pageCount: Number,
  publicationYear: Number,
  status: {
    type: String,
    enum: ['read', 'currently_reading', 'want_to_read'],
    default: 'want_to_read',
  },
  
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
