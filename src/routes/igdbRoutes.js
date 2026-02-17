const express = require("express");
const { igdbPost } = require("../services/igdbClient");

const router = express.Router();

router.get("/games/search", async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim();
    if (!q) return res.status(400).json({ error: "Missing query parameter q" });

    const body = `
      search "${q.replace(/"/g, '\\"')}";
      fields id, name, cover.image_id;
      limit 10;
    `;

    const data = await igdbPost("/games", body);

    const results = (data || []).map((g) => {
      const imageId = g.cover?.image_id;
      const coverUrl = imageId
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`
        : null;

      return { igdbId: g.id, name: g.name, coverUrl };
    });

    res.json({ results });
  } catch (err) {
    console.error("IGDB search error:", err?.response?.data || err.message);
    res.status(500).json({ error: "IGDB search failed" });
  }
});

module.exports = router;