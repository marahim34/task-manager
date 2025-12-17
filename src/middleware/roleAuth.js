const requireAuth = (req, res, next) => {
    if (!req.user) 
        return res.status(401).json({ error: "Authentication required" });

    next();
}

const authorizeRoles = (...roles) => (req, res, next) => {
    requireAuth(req, res, () => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Access denied" });
        }
        
        next();   
    })
}

module.exports = authorizeRoles;