const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: [{ type: String, required: true }],
  genres: [{ type: String }],
  pageCount: {type: Number, default: null},
  publicationYear: {type: Number, default: null},
  status: {
    type: String,
    enum: ['read', 'currentlyReading', 'owned', 'want', "rereading"],
    default: 'want',
  },
  rereadCount: {type: Number, default: 0},
  format: {type: String, enum: ['physical', 'ebook', 'library'], default: null},
  series: { type: String, default: null},
  seriesNum: {type: Number, min: 0, max: 999, default: null, validate: {
    validator: v => v == null || Number.isInteger(v),
    message: 'seriesNum must be an integer'
  }},
  rating: {type: Number, default: null},
  dateAdded: {type: Date, default: Date.now},
  dateFinished: {type: Date, default: null},
  isbn10: {type: String, default: null},
  isbn13: {type: String, default: null},
  asin: {type: String, default: null},
  kindleUnlimited: {type: Boolean, default: false},
  libby: {type: Boolean, default: false},
  owner: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
  },
}, {timestamps: true});

bookSchema.index({owner: 1});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
