// CRUD logic for books
const Movie = require("../models/Movie");

const splitSemi = (val) =>
  String(val ?? "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

const normalizeStringArray = (val) => {
  if (Array.isArray(val)) return val.flatMap(splitSemi); // flattens safely
  return splitSemi(val);
};

const uniq = (arr) => [...new Set(arr)];
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
      director: uniq(normalizeStringArray(req.body.director)),
      screenwriter: req.body.screenwriter,
      studio: req.body.studio,
      productionCompany: uniq(normalizeStringArray(req.body.productionCompany)),
      actors: uniq(normalizeStringArray(req.body.actors)),
      genres: uniq(normalizeStringArray(req.body.genres)),
      duration: req.body.duration,
      releaseYear: req.body.releaseYear,
      status: req.body.status,
      rewatchCount: req.body.rewatchCount,
      format: req.body.format,
      series: req.body.series,
      seriesNum:
        req.body.seriesNum == null || req.body.seriesNum === ""
          ? null
          : Number(req.body.seriesNum),
      rating: req.body.rating,
      dateFinished:
        req.body.status === "watched"
          ? req.body.dateFinished
            ? new Date(req.body.dateFinished)
            : new Date()
          : null,
      dateAdded: req.body.dateAdded,
      storyBy: uniq(normalizeStringArray(req.body.storyBy)),
      producers: uniq(normalizeStringArray(req.body.producers)),
      cinematography: uniq(normalizeStringArray(req.body.cinematography)),
      musicBy: uniq(normalizeStringArray(req.body.musicBy)),
      country: uniq(normalizeStringArray(req.body.country)),
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
    if ("actors" in updates)
      updates.actors = uniq(normalizeStringArray(updates.actors));
    if ("genres" in updates)
      updates.genres = uniq(normalizeStringArray(updates.genres));
    if ("director" in updates)
      updates.director = uniq(normalizeStringArray(updates.director));
    if ("productionCompany" in updates)
      updates.productionCompany = uniq(normalizeStringArray(updates.productionCompany));
    if ("storyBy" in updates)
      updates.storyBy = uniq(normalizeStringArray(updates.storyBy));
    if ("producers" in updates)
        updates.producers = uniq(normalizeStringArray(updates.producers));
    if ("cinematography" in updates)
        updates.cinematography = uniq(normalizeStringArray(updates.cinematography));
    if ("musicBy" in updates)
        updates.musicBy = uniq(normalizeStringArray(updates.musicBy));
    if ("country" in updates)
        updates.country = uniq(normalizeStringArray(updates.country));
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
