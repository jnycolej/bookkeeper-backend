const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  director: [{ type: String, required: true }],
  screenwriter: [{type: String}],
  actor: [{type: String}],
  genres: [{ type: String }],
  duration: { type: Number, default: null },
  releaseDate: { type: Number, default: null },
  status: {
    type: String,
    enum: ["seen", "wantToSee"],
    default: "wantToSee",
  },
  format: {
    type: String,
    enum: ["physical", "streaming", "digital"],
    default: null,
  },
  series: { type: String, default: null },
  seriesNum: {
    type: Number,
    min: 0,
    max: 999,
    default: null,
    validate: {
      validator: (v) => v == null || Number.isInteger(v),
      message: "seriesNum must be an integer",
    },
  },
  rating: {type: Number, default: null},
  dateAdded: {type: Date, default: Date.now},

}, {timestamps: true});

movieSchema.index({ owner: 1});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
