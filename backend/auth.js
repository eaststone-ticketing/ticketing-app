import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


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
      { expiresIn: "2h" }
    );

    res.json({
      token,
      userId: user.id,
      userName: user.username
    });
})

return router;
}