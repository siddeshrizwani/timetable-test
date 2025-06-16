// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");

dotenv.config();
require("./config/passport-setup");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5174",
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "a_very_secret_session_key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Route Imports
const authRoutes = require("./routes/auth");
const apiRoutes = require("./routes/apiRoutes");
const profileRoutes = require("./routes/profileRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const {
  authenticateToken,
  authorizeAdmin,
} = require("./middleware/authMiddleware");

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", authenticateToken, profileRoutes);
app.use("/api/faculty", authenticateToken, facultyRoutes);
app.use("/api", authenticateToken, authorizeAdmin, apiRoutes);

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
