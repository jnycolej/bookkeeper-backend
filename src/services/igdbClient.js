const axios = require("axios");

const {
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
  IGDB_API_BASE = "https://api.igdb.com/v4",
  IGDB_TOKEN_TTL_BUFFER_SECONDS = 120,
} = process.env;

let tokenCache = {
  accessToken: null,
  expiresAtMs: 0,
};

async function getTwitchToken() {
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    throw new Error("Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET");
  }

  const now = Date.now();
  if (tokenCache.accessToken && now < tokenCache.expiresAtMs) {
    return tokenCache.accessToken;
  }

  const url = "https://id.twitch.tv/oauth2/token";
  const res = await axios.post(url, null, {
    params: {
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      grant_type: "client_credentials",
    },
  });

  const { access_token, expires_in } = res.data;

  const bufferMs = Number(IGDB_TOKEN_TTL_BUFFER_SECONDS) * 1000;
  tokenCache.accessToken = access_token;
  tokenCache.expiresAtMs = Date.now() + expires_in * 1000 - bufferMs;

  return tokenCache.accessToken;
}

async function igdbPost(endpoint, body) {
  const token = await getTwitchToken();

  const res = await axios.post(`${IGDB_API_BASE}${endpoint}`, body, {
    headers: {
      "Client-ID": TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
  });

  return res.data;
}

module.exports = { igdbPost };