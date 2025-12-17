const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js")
const {validateRegister, validateLogin} = require("../validators/authValidator.js")

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/register", validateRegister, async (req, res) => {
    try {
        const {email, password, name, role} = req.body;

        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(400).json({ error: 'Email already registered' });
        }

        const user = new User({email, password, name, role});
        await user.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        })
    } catch (error) {
        res.status(500).json({ error: 'Registration failed', message: error.message });
    }
} )


router.post("/login", validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
        { id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' }
        );

        res.json({
        message: 'Login successful',
        token,
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
        }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed', message: error.message });
    }
})


module.exports = router;
