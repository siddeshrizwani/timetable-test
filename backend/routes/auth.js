const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../server"); // Import the PostgreSQL pool
const { authenticateToken } = require("../middleware/authMiddleware");
const { v4: uuidv4 } = require("uuid"); // For generating unique refresh tokens

// router.post("/register", async (req, res) => {
//   const { username, password, role } = req.body;
//   if (!username || !password || !role) {
//     return res
//       .status(400)
//       .send({ msg: "Username, password, and role are required" });
//   }
//   if (!["super", "admin", "user"].includes(role)) {
//     return res.status(400).send({ msg: "Invalid role" });
//   }

//   try {
//     const roleResult = await pool.query(
//       "SELECT id FROM roles WHERE name = $1",
//       [role]
//     );
//     if (roleResult.rows.length === 0) {
//       return res.status(400).send({ msg: "Invalid role specified" });
//     }
//     const roleId = roleResult.rows[0].id;

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = await pool.query(
//       "INSERT INTO users (username, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id, username",
//       [username, hashedPassword, roleId]
//     );

//     res.status(201).send({
//       id: newUser.rows[0].id,
//       username: newUser.rows[0].username,
//       role: role,
//     });
//   } catch (error) {
//     console.error(error);
//     if (error.code === "23505") {
//       // Unique violation
//       return res.status(409).send({ msg: "Username already exists" });
//     }
//     res.status(500).send({ msg: "Error creating user" });
//   }
// });

router.post("/login", async (req, res) => {
    console.log("Reached the /login route");
    console.log("Value of pool:", pool); 
    const { username, password } = req.body;
    console.log("Login attempt for username:", username);
  if (!username || !password) {
    return res.status(400).send({ msg: "Username and password are required" });
  }

  try {
    const userResult = await pool.query(
      `
            SELECT u.id, u.username, u.password_hash, r.name as role
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.username = $1
        `,
      [username]
    );
    console.log("Database query result:", userResult.rows);
    if (userResult.rows.length === 0) {
      return res.status(401).send({ msg: "Invalid credentials" });
    }

      const user = userResult.rows[0];
      const tempHash = await bcrypt.hash(password, 10);
      console.log("Newly generated hash of entered password:", tempHash);
      console.log("Stored password hash from database:", user.password_hash);
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      console.log("Password comparison result:", isValidPassword);
    if (!isValidPassword) {
      return res.status(401).send({ msg: "Invalid credentials" });
    }
    console.log("Login successful, token generated");
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    }); // Short-lived access token

    // Generate refresh token
    const refreshToken = uuidv4();
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Example: Refresh token expires in 7 days

    // Store refresh token in database
    await pool.query(
      "INSERT INTO refresh_tokens (refresh_token_id, user_id, refresh_token, expiry_date) VALUES ($1, $2, $3, $4)",
      [refreshToken, user.id, refreshToken, expiryDate]
    );

    res.send({ accessToken, refreshToken, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error logging in" });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ msg: "Refresh token is required" });
  }

  try {
    const refreshTokenResult = await pool.query(
      "SELECT rt.refresh_token_id, rt.user_id, rt.expiry_date, rt.revoked, u.username, r.name as role FROM refresh_tokens rt JOIN users u ON rt.user_id = u.id JOIN roles r ON u.role_id = r.id WHERE rt.refresh_token = $1",
      [refreshToken]
    );

    if (refreshTokenResult.rows.length === 0) {
      return res.status(401).json({ msg: "Invalid refresh token" });
    }

    const tokenData = refreshTokenResult.rows[0];

    if (tokenData.revoked) {
      return res.status(401).json({ msg: "Refresh token has been revoked" });
    }

    if (new Date(tokenData.expiry_date) < new Date()) {
      return res.status(401).json({ msg: "Refresh token has expired" });
    }

    const payload = {
      id: tokenData.user_id,
      username: tokenData.username,
      role: tokenData.role,
    };

    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Optional: Implement refresh token rotation here by generating a new refresh token
    // and invalidating the old one. For simplicity, we'll reuse the same refresh token in this example.

    res.json({ accessToken: newAccessToken, refreshToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ msg: "Error refreshing token" });
  }
});

module.exports = router;
