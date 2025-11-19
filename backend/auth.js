import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

export default function authRouter(db){
const router = express.Router();

router.post("/login", async(req, res) => {
    const {username, password} = req.body;

    const user = await db.get(
        `SELECT * FROM users WHERE username = ?`,
        username
    );
    
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || "super-secret-key",
      { expiresIn: "15m" }
    );

        const refreshToken = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_REFRESH_SECRET || "super-secret-refresh-key",
      { expiresIn: "7d" } // Refresh token expiry time
    );

    // Set the refresh token in a cookie (HttpOnly cookie, secure and sameSite are important for security)
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,  // Cannot be accessed by JavaScript, only sent with requests to your server
      secure: process.env.NODE_ENV === "production",  // Set to true for HTTPS connections (should be true in production)
      sameSite: "Strict",  // Only send the cookie for same-site requests
      maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days expiration for refresh token
    });

    res.json({
      token,
      userId: user.id,
      userName: user.username
    });
})

return router;
}