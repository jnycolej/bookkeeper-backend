const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  director: [{ type: String, required: true }],
  screenwriter: [{type: String}],
  studio: { type: String},
  actors: [{type: String}],
  genres: [{ type: String }],
  duration: { type: Number, default: null },
  releaseYear: { type: Number, default: null },
  status: {
    type: String,
    enum: ["watched", "wantToWatch", "watching", "owned"],
    default: "wantToWatch",
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
  dateFinished: {type:Date, default: null},
  dateAdded: {type: Date, default: Date.now},
  owner: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
  },

}, {timestamps: true});

movieSchema.index({ owner: 1});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
