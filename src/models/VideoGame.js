const mongoose = require("mongoose");

const videoGameSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    series: { type: String },
    seriesNum: { type: Number },
    developer: [{ type: String, required: true }],
    publisher: [{ type: String }],
    designer: [{ type: String }],
    programmers: [{ type: String }],
    artist: [{ type: String }],
    writers: [{ type: String }],
    composer: [{ type: String }],
    engine: { type: String },
    platforms: [{ type: String }],
    actors: [{ type: String, required: true }],
    genres: [{ type: String, required: true }],
    country: [{ type: String }],
    mode: [{ type: String }],
    releaseYear: { type: Number },
    duration: { type: Number },
    format: [{ type: String }],
    status: {
      type: String,
      enum: ["completed", "playing", "wantToPlay"],
      default: "wantToPlay",
    },
    rating: { type: Number },
    dateAdded: { type: Date },
    dateStarted: { type: Date },
    dateFinished: { type: Date },

    igdbId: {type:String},
    coverUrl: {type: String},

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

videoGameSchema.index({ owner: 1 });

const VideoGame = mongoose.model("videoGame", videoGameSchema);

module.exports = VideoGame;
