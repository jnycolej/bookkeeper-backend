// backend/src/routes/tvRoutes.js
const express = require("express");
const router = express.Router();

const {
  getAllTVShows,
  createTVShow,
  getTVShowById,
  updateTVShow,
  deleteTVShow,
  countTVShowsByStatus,
  getDistinctGenres,
  getYearlyTVShowCount,
} = require("../controllers/tvShowController");

// Count endpoint
router.get("/count", countTVShowsByStatus);

//Year count endpoint
router.get("/watch-count/:year", getYearlyTVShowCount);
// Genres endpoint
//    GET /api/tvshows/genres
router.get("/genres", getDistinctGenres);

// Standard CRUD on the collection
router.route("/")
  .get(getAllTVShows)
  .post(createTVShow);

// Single‐game operations
router.route("/:id").get(getTVShowById).put(updateTVShow).delete(deleteTVShow);

module.exports = router;
