const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: [{ type: String, required: true }],
  genres: [{ type: String }],
  pageCount: {type: Number, default: null},
  publicationYear: {type: Number, default: null},
  status: {
    type: String,
    enum: ['read', 'currently_reading', 'unread'],
    default: 'unread',
  },
  series: { type: String},
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, {timestamps: true});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
