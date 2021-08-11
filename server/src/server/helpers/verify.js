const jwt = require("jsonwebtoken");

// function to verify the token from the request params
module.exports.verifyToken = async (req, res, next) => {
    try {
        const token = await req.body.token || req.query.token || req.headers["x-access-token"];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.decoded = decoded;
            next();
        } else {
            res.status(403).json({
                success: false,
                message: "No token provided"
            });
        }
    } catch (err) {
        res.status(403).json({
            success: false,
            message: "Token is invalid"
        });
    }
}