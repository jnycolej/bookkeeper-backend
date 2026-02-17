// backend/src/services/tmdbClient.js
const axios = require("axios");

const tmdb = axios.create({
  baseURL: process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3",
  headers: {
    Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
    "Content-Type": "application/json;charset=utf-8",
  },
});

module.exports = tmdb;