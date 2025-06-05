const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
//const { user } = require('pg/lib/defaults.js');

const saltRounds = 10;

bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) {
        return;
    }
});

//Registration Routes
router.post('/register', async (req, res) => {
    //accept {username, password} from req.body
    const {username, password, displayName} = req.body;

    //returns a success (e.g. HTTP 201) or an error if the username is already taken
    const existing = await User.findOne({username});
    if(existing) {
        return res.status(400).json({error: 'Username is already taken.'});
    }

    //uses bcrypt.hash(plainPassword, saltRounds) and stores { username, password: hashedPassword} in the User collection
    const hash = await bcrypt.hash(password, saltRounds);

    //Create the user
    const user = new User({
        username,
        password: hash,
        displayName: displayName || username
    });

    await user.save();

    return res.status(201).json({message: 'User created successfully'});
});

//Login Routes
router.post('/login', async (req, res) => {
    //Accepts {username, password } from req.body
    const {username, password} = req.body;
    
    //Looks up the users in MongoDB: User.findOne({username})
    const user = await User.findOne({username});
    if (!user) {
        return res.status(401).json({error: 'Invalid credentials.'});
    }
    //If found, calls bcrypt.compare(plainPassword, user.password)
    const match = await bcrypt.compare(password, user.password);
    //If it doesnt match, return 401 Unauthorized
    if (!match) {
        return res.status(401).json({ error: 'Invalid credentials.'});
    }
    
    //Build JWT payload
    const payload = {
        sub: user._id.toString(),
        displayName: user.displayName,
        //iat: Math.floor(Date.now() / 1000)
    };

    //Sign the token with your secret; set an expiration
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });
    
    //If it matches, send back a success payload (e.g. a JWT or a simple {success: true, userId: ...} if your doing sessions)
   return res.json({token});
    //res.json({ success: true, userId: user._id, displayName: user.displayName});
});

router.get('/me', authMiddleware, async (req, res) => {
    
    const user = await User.findById(req.userId).select('-password');
    if(!user) {
        return res.status(404).json({error: 'User not found.'});
    }

    //Return the minimal profile the frontend needs:
    return res.json({
        id: user._id,
        username: user.username,
        displayName: user.displayName
    });
});

module.exports = router;