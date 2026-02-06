// backend/src/routes/videoGameRoutes.js
const express = require("express");
const router = express.Router();

const {
  getAllVideoGames,
  createVideoGame,
  getVideoGameById,
  updateVideoGame,
  deleteVideoGame,
  countVideoGamesByStatus,
  getDistinctGenres,
  getYearlyVideoGameCount,
} = require("../controllers/videoGameController");

// Count endpoint
router.get("/count", countVideoGamesByStatus);

//Year count endpoint
router.get("/watch-count/:year", getYearlyVideoGameCount);
// Genres endpoint
//    GET /api/games/genres
router.get("/genres", getDistinctGenres);

// Standard CRUD on the collection
router.route("/").get(getAllVideoGames).post(createVideoGame);

// Single‐game operations
router
  .route("/:id")
  .get(getVideoGameById)
  .put(updateVideoGame)
  .delete(deleteVideoGame);

module.exports = router;
