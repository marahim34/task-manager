const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

const JWT_SECRET = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization'); 

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({error: "No auth header found"})
        }

        const token = authHeader.substring(7);

        
        const decodedUser = jwt.verify(token, JWT_SECRET);
        
        req.user = {
            _id: decodedUser.id,  
            role: decodedUser.role
        };
        
        next();
        
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        res.status(401).json({ error: 'Authentication failed' });
    }
}

module.exports = auth;