// backend/src/routes/bookRoutes.js
const express = require('express');
const router  = express.Router();

const {
  getAllBooks,
  createBook,
  getBookById,
  updateBook,
  deleteBook,
  countBooksByStatus,
  getDistinctGenres,
  getYearlyReadCount
} = require('../controllers/bookController');

// 1) Count endpoint
//    GET /api/books/count
router.get('/count', countBooksByStatus);

//Year count endpoint
router.get('/read-count/:year', getYearlyReadCount);
// 2) Genres endpoint
//    GET /api/books/genres
router.get('/genres', getDistinctGenres);

// 3) Standard CRUD on the collection
//    GET  /api/books
//    POST /api/books
router
  .route('/')
  .get(getAllBooks)
  .post(createBook);

// 4) Single‐book operations
//    GET    /api/books/:id
//    PUT    /api/books/:id
//    DELETE /api/books/:id
router
  .route('/:id')
  .get(getBookById)
  .put(updateBook)
  .delete(deleteBook);

module.exports = router;