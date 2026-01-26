// backend/src/routes/movieRoutes.js
const express = require("express");
const router = express.Router();

const {
  getAllMovies,
  createMovie,
  getMovieById,
  updateMovie,
  deleteMovie,
  countMoviesByStatus,
  getDistinctGenres,
  getYearlyMovieCount,
} = require("../controllers/movieController");

// Count endpoint
router.get("/count", countMoviesByStatus);

//Year count endpoint
router.get("/watch-count/:year", getYearlyMovieCount);
// Genres endpoint
//    GET /api/books/genres
router.get("/genres", getDistinctGenres);

// Standard CRUD on the collection
router.route("/").get(getAllMovies).post(createMovie);

// Single‐book operations
router.route("/:id").get(getMovieById).put(updateMovie).delete(deleteMovie);

module.exports = router;
