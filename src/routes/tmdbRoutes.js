const express = require("express");
const tmdb = require("../services/tmdbClient.js");

const router = express.Router();

// Movie poster path
router.get("/movie/:id", async (req, res, next) => {
  try {
    const { data } = await tmdb.get(`/movie/${req.params.id}`);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

// TV Poster
router.get("/tv/:id", async (req, res, next) => {
  try {
    const { data } = await tmdb.get(`/tv/${req.params.id}`);
    res.json({
      id: data.id,
      name: data.name,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
    });
  } catch (e) {
    next(e);
  }
});

// Search Movie by title
router.get("/search/movie", async (req, res, next) => {
  try {
    const q = req.query.q;
    const { data } = await tmdb.get("/search/movie", { params: { query: q } });
    res.json(data);
  } catch (e) {
    next(e);
  }
});

// Search TV by title
router.get("/search/tv", async (req, res, next) => {
  try {
    const q = req.query.q;
    const { data } = await tmdb.get("/search/tv", { params: { query: q } });
    res.json(data);
  } catch (e) {
    next(e);
  }
});

module.exports = router;