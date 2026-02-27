const TVShow = require("../models/TVShow");

exports.getAllTVShows = async (req, res) => {
  try {
    //Only return games belonging to this user
    const tvShows = await TVShow.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json(tvShows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch shows." });
  }
};
exports.createTVShow = async (req, res) => {
  const splitSemi = (v) =>
    Array.isArray(v)
      ? v
      : String(v || "")
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean);

  try {
    const payload = {
      title: req.body.title,
      creator: splitSemi(req.body.creator),
      showRunner: req.body.showRunner,
      writers: req.body.writers,
      network: req.body.network,
      actors: splitSemi(req.body.actors),
      genres: splitSemi(req.body.genres),
      musicBy: splitSemi(req.body.musicBy),
      execProducers: splitSemi(req.body.execProducers),
      producers: splitSemi(req.body.producers),
      cinematography: splitSemi(req.body.cinematography),
      cameraSetup: splitSemi(req.body.cameraSetup),
      avgRuntime: req.body.avgRuntime,
      productionCompanies: splitSemi(req.body.productionCompanies),
      language: req.body.language,
      country: req.body.country,
      stillRunning: req.body.stillRunning,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      seasons: req.body.seasons,
      episodes: req.body.episodes,
      basedOn: req.body.basedOn,
      status: req.body.status,
      rewatchCount: req.body.rewatchCount,
      dateAdded: req.body.dateAdded,
      dateStarted: req.body.dateStarted,
      dateFinished:
        req.body.status === "watched"
          ? req.body.dateFinished
            ? new Date(req.body.dateFinished)
            : new Date()
          : null,
      owner: req.user._id,
    };

    const saved = await TVShow.create(payload);
    return res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create tv show" });
  }
};

exports.getTVShowById = async (req, res) => {
  try {
    const tvShowId = req.params.id;
    //Find the tv show only if it belongs to this user
    const tvShow = await TVShow.findOne({ _id: tvShowId, owner: req.user._id });
    if (!tvShow) {
      return res.status(404).json({ error: "TV show not found." });
    }
    return res.json(tvShow);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch the show" });
  }
};

exports.updateTVShow = async (req, res) => {
  try {
    const tvShowId = req.params.id;

    // Get existing book first so we can compare status/dateFinished
    const existing = await TVShow.findOne({
      _id: tvShowId,
      owner: req.user._id,
    });
    if (!existing) {
      return res.status(404).json({ error: "Show not found or not yours." });
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

    // If status is being changed away from "watched", clear dateFinished
    if (updates.status && updates.status !== "watched") {
      updates.dateFinished = null;
    }

    const updated = await TVShow.findOneAndUpdate(
      { _id: tvShowId, owner: req.user._id },
      { $set: updates },
      { new: true, runValidators: true },
    );

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update the show." });
  }
};

exports.deleteTVShow = async (req, res) => {
  try {
    const tvShowId = req.params.id;
    // Only delete if owner matches
    const deleted = await TVShow.findOneAndDelete({
      _id: tvShowId,
      owner: req.user._id,
    });
    if (!deleted) {
      return res.status(404).json({ error: "Show not found or not yours." });
    }
    return res.json({ message: "Show deleted." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete the tv show." });
  }
};

exports.countTVShowsByStatus = async (req, res) => {
  try {
    const counts = await TVShow.aggregate([
      { $match: { owner: req.user._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const result = counts.reduce(
      (acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      },
      { watched: 0, wantToWatch: 0, watching: 0 },
    );
    return res.json(result);
  } catch (err) {
    console.error("Error fetching tv show counts:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Returns all distinct genres for this user's books
exports.getDistinctGenres = async (req, res) => {
  try {
    const genres = await TVShow.distinct("genres", { owner: req.user._id });
    return res.json(genres.sort());
  } catch (err) {
    console.error("Error fetching genres:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getYearlyTVShowCount = async (req, res) => {
  try {
    const year = Number(req.params.year);
    if (!Number.isInteger(year)) {
      return res.status(400).json({ error: "Invalid year." });
    }

    const start = new Date(year, 0, 1); // Jan 1
    const end = new Date(year + 1, 0, 1); // Jan 1 next year (exclusive)

    const count = await TVShow.countDocuments({
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
