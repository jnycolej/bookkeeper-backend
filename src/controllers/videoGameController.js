const VideoGame = require("../models/VideoGame");

exports.getAllVideoGames = async (req, res) => {
  try {
    const videoGames = await VideoGame.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json(videoGames);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch games." });
  }
};

exports.createVideoGame = async (req, res) => {
  try {
    // ✅ Create a Mongoose document, not a plain object
    const newVideoGame = new VideoGame({
      title: req.body.title,
      series: req.body.series,
      seriesNum: req.body.seriesNum,

      developer: req.body.developer,
      publisher: req.body.publisher,
      designer: req.body.designer,
      programmers: req.body.programmers, // ✅ was req.body.directors (wrong)
      artist: req.body.artist,
      writers: req.body.writers,
      composer: req.body.composer,

      engine: req.body.engine,
      platforms: req.body.platforms,
      actors: req.body.actors,

      genres: req.body.genres,
      country: req.body.country,
      mode: req.body.mode,

      releaseYear: req.body.releaseYear,
      duration: req.body.duration,
      format: req.body.format,

      status: req.body.status,
      replayCount: req.body.replayCount,
      rating: req.body.rating,

      dateAdded: req.body.dateAdded,
      dateStarted: req.body.dateStarted,
      dateFinished:
        req.body.status === "completed"
          ? req.body.dateFinished
            ? new Date(req.body.dateFinished)
            : new Date()
          : null,

      owner: req.user._id,
    });

    const saved = await newVideoGame.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: err.message, name: err.name });
  }
};

exports.getVideoGameById = async (req, res) => {
  try {
    const videoGameId = req.params.id;

    const videoGame = await VideoGame.findOne({
      _id: videoGameId,
      owner: req.user._id,
    });

    if (!videoGame) {
      return res.status(404).json({ error: "Video Game not found." });
    }

    return res.json(videoGame); // ✅ was res.json(movie)
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch the game" });
  }
};

exports.updateVideoGame = async (req, res) => {
  try {
    const videoGameId = req.params.id;

    const existing = await VideoGame.findOne({
      _id: videoGameId,
      owner: req.user._id,
    });

    if (!existing) {
      return res
        .status(404)
        .json({ error: "Video game not found or not yours." });
    }

    const updates = { ...req.body };

    // ✅ Handle completed ↔ not completed dateFinished logic
    if (updates.status === "completed") {
      if (updates.dateFinished) {
        updates.dateFinished = new Date(updates.dateFinished);
      } else if (!existing.dateFinished) {
        updates.dateFinished = new Date();
      }
    }

    if (updates.status && updates.status !== "completed") {
      updates.dateFinished = null;
    }

    const updated = await VideoGame.findOneAndUpdate(
      { _id: videoGameId, owner: req.user._id },
      { $set: updates },
      { new: true, runValidators: true },
    );

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update the video game." });
  }
};

exports.deleteVideoGame = async (req, res) => {
  try {
    const videoGameId = req.params.id;

    const deleted = await VideoGame.findOneAndDelete({
      _id: videoGameId,
      owner: req.user._id,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ error: "Video game not found or not yours." });
    }

    return res.json({ message: "Video game deleted." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete the video game." });
  }
};

exports.countVideoGamesByStatus = async (req, res) => {
  try {
    const counts = await VideoGame.aggregate([
      { $match: { owner: req.user._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const result = counts.reduce(
      (acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      },
      { completed: 0, playing: 0, wantToPlay: 0 },
    );

    return res.json(result);
  } catch (err) {
    console.error("Error fetching video game counts:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getDistinctGenres = async (req, res) => {
  try {
    const genres = await VideoGame.distinct("genres", { owner: req.user._id });
    return res.json(genres.filter(Boolean).sort());
  } catch (err) {
    console.error("Error fetching genres:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getYearlyVideoGameCount = async (req, res) => {
  try {
    const year = Number(req.params.year);
    if (!Number.isInteger(year)) {
      return res.status(400).json({ error: "Invalid year." });
    }

    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const count = await VideoGame.countDocuments({
      owner: req.user._id,
      status: "completed",
      dateFinished: { $gte: start, $lt: end },
    });

    return res.json({ year, count });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Failed to fetch yearly play count." });
  }
};
