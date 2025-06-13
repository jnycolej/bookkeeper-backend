// backend/src/middleware/auth.js
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa            = require('jwks-rsa');
const User               = require('../models/User');

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true, rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer:   `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

async function attachUser(req, res, next) {
  try {
    const {sub: auth0Id, email, name} = req.auth;

    // Find or create the user
    let user = await User.findOne({ auth0Id });
    if (!user) {
      user = await User.create({
        auth0Id,
        email: email || `${auth0Id}@clients`,
        username: name || auth0Id,          
        displayName: name || auth0Id,
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('✖ attachUser error:', err);
    res.status(500).json({ message: 'Could not attach user' });
  }
}

module.exports = { checkJwt, attachUser };
