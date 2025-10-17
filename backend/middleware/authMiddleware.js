const jwt = require("jsonwebtoken");
const User = require("../model/userModel"); // adjust the path
const AppError = require("../utils/app-error");

exports.protect = async (req, res, next) => {
    try {
        console.log("[Auth] protect middleware invoked.", req.cookies);

        let token;

        // 2️⃣ Fallback: Get token from Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        // 3️⃣ No token found
        if (!token) {
            return next(new AppError("Not authorized, no token provided", 401));
        }

        // 4️⃣ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5️⃣ Attach user to request
        req.user = await User.findById(decoded.userId).select("-password");

        if (!req.user) {
            return next(new AppError("User not found", 404));
        }

        next();
    } catch (err) {
        console.error("[Auth Error]", err);
        return next(new AppError("Not authorized", 401));
    }
};
