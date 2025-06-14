const express = require('express');
const router = express.Router();

//Returns full Mongo user document
router.get('/me', (req, res) => {
    res.json(req.user);
});

//Accepts a JSON body of fields to update
router.put('/me', async (req, res) => {
    try {
        //req.user is a Mongoose model instance
        Object.assign(req.user, req.body);
        const updated = await req.user.save();
        res.json(updated);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Could not update profile'});
    }
});

module.exports = router;
