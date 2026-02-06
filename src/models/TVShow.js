const mongoose = require("mongoose");

const tvShowSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    creator: [{ type: String, required: true }],
    showRunner: [{ type: String }],
    writers: [{ type: String }],
    actors: [{ type: String, required: true }],
    network: [{ type: String }],
    genres: [{ type: String, required: true }],
    language: [{ type: String }],
    country: [{ type: String }],
    stillRunning: { type: Boolean },
    musicBy: [{ type: String }],
    execProducers: [{ type: String }],
    producers: [{ type: String }],
    cinematography: [{ type: String }],
    cameraSetup: [{ type: String }],
    avgRuntime: { type: Number },
    productionCompanies: [{ type: String }],
    startDate: { type: Date },
    endDate: { type: Date },
    seasons: { type: Number, required: true },
    episodes: { type: Number, required: true },
    basedOn: { type: String },
    status: {
      type: String,
      enum: ["watched", "watching", "wantToWatch"],
      default: "wantToWatch",
    },
    dateAdded: { type: Date },
    dateStarted: { type: Date },
    dateFinished: { type: Date },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

tvShowSchema.index({ owner: 1 });

const TVShow = mongoose.model("TVShow", tvShowSchema);

module.exports = TVShow;
