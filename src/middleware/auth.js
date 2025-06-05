const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({error: 'Missing or invalid Authorization header'});
    }

    const token = authHeader.split(' ')[1]; // the part after "Bearer "

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded.sub;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token'});
    }
};