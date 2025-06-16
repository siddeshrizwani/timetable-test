// backend/routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../config/db");

// GET the logged-in user's profile
// This route uses the userId from the JWT, not from the URL params, for security
router.get("/me", async (req, res) => {
  try {
    // req.user is populated by the authenticateToken middleware
    const userId = req.user.id;

    const profileQuery = `
            SELECT u.id, u.username, u.email, u.provider, t.name as teacher_name, t.teacher_id
            FROM users u
            LEFT JOIN teachers t ON u.id = t.user_id
            WHERE u.id = $1
        `;
    const result = await pool.query(profileQuery, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: "User profile not found." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

// PUT (update) the logged-in user's profile
router.put("/me", async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ msg: "Name and email are required." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update users table
    await client.query(
      "UPDATE users SET username = $1, email = $2 WHERE id = $3",
      [name, email, userId]
    );

    // Update teachers table
    await client.query(
      "UPDATE teachers SET name = $1, email = $2 WHERE user_id = $3",
      [name, email, userId]
    );

    await client.query("COMMIT");
    res.json({ msg: "Profile updated successfully." });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating profile:", err);
    if (err.code === "23505") {
      // Unique key violation
      return res
        .status(409)
        .json({ msg: "This email address is already in use." });
    }
    res.status(500).json({ msg: "Internal Server Error" });
  } finally {
    client.release();
  }
});

// POST to change the user's password
router.post("/change-password", async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ msg: "All password fields are required." });
  }

  try {
    const userResult = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1 AND provider = 'local'",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res
        .status(403)
        .json({ msg: "Password cannot be changed for this account type." });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ msg: "Incorrect current password." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      hashedNewPassword,
      userId,
    ]);

    res.json({ msg: "Password changed successfully." });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = router;
