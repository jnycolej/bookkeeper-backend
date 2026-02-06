// CRUD logic for books
const Movie = require("../models/Movie");

exports.getAllMovies = async (req, res) => {
  try {
    //Only return books belonging to this user
    const movies = await Movie.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json(movies);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch movies." });
  }
};

exports.createMovie = async (req, res) => {
  try {
    // req.body holds the book data from the client
    // req.user._id was set by authMiddleware
    const newMovie = new Movie({
      title: req.body.title,
      series: req.body.series,
      seriesNum:
        req.body.seriesNum == null || req.body.seriesNum === ""
          ? null
          : Number(req.body.seriesNum),
      duration: req.body.duration,
      director: req.body.director,
      screenwriter: req.body.screenwriter,
      studio: req.body.studio,
      actors: req.body.actors,
      genres: req.body.genres,
      releaseYear: req.body.releaseDate,
      format: req.body.format,
      rating: req.body.rating,
      status: req.body.status,
      dateFinished:
        req.body.status === "watched"
          ? req.body.dateFinished
            ? new Date(req.body.dateFinished)
            : new Date()
          : null,
      dateAdded: req.body.dateAdded,
      owner: req.user._id,
    });
    const saved = await newMovie.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create movie." });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const movieId = req.params.id;
    //Find the movie only if it belongs to this user
    const movie = await Movie.findOne({ _id: movieId, owner: req.user._id });
    if (!movie) {
      return res.status(404).json({ error: "Movie not found." });
    }
    return res.json(movie);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch the movie." });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const movieId = req.params.id;

    // Get existing book first so we can compare status/dateFinished
    const existing = await Movie.findOne({ _id: movieId, owner: req.user._id });
    if (!existing) {
      return res.status(404).json({ error: "Movie not found or not yours." });
    }

    const updates = { ...req.body };

    // If status is being set to "read", set dateFinished (if missing)
    if (updates.status === "watched") {
      // If client provided a dateFinished explicitly, honor it
      if (updates.dateFinished) {
        updates.dateFinished = new Date(updates.dateFinished);
      } else if (!existing.dateFinished) {
        updates.dateFinished = new Date();
      }
    }

    // If status is being changed away from "read", clear dateFinished
    if (updates.status && updates.status !== "watched") {
      updates.dateFinished = null;
    }

    const updated = await Movie.findOneAndUpdate(
      { _id: movieId, owner: req.user._id },
      { $set: updates },
      { new: true, runValidators: true },
    );

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update the movie." });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    // Only delete if owner matches
    const deleted = await Movie.findOneAndDelete({
      _id: movieId,
      owner: req.user._id,
    });
    if (!deleted) {
      return res.status(404).json({ error: "Movie not found or not yours." });
    }
    return res.json({ message: "Movie deleted." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete the movie." });
  }
};

exports.countMoviesByStatus = async (req, res) => {
  try {
    const counts = await Movie.aggregate([
      { $match: { owner: req.user._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const result = counts.reduce(
      (acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      },
      { watched: 0, want: 0, owned: 0 },
    );
    return res.json(result);
  } catch (err) {
    console.error("Error fetching movie counts:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Returns all distinct genres for this user's books
exports.getDistinctGenres = async (req, res) => {
  try {
    const genres = await Movie.distinct("genres", { owner: req.user._id });
    return res.json(genres.sort());
  } catch (err) {
    console.error("Error fetching genres:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getYearlyMovieCount = async (req, res) => {
  try {
    const year = Number(req.params.year);
    if (!Number.isInteger(year)) {
      return res.status(400).json({ error: "Invalid year." });
    }

    const start = new Date(year, 0, 1); // Jan 1
    const end = new Date(year + 1, 0, 1); // Jan 1 next year (exclusive)

    const count = await Movie.countDocuments({
      owner: req.user._id,
      status: "watched",
      dateFinished: { $gte: start, $lt: end },
    });

    return res.json({ year, count });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Failed to fetch yearly watch count." });
  }
};
