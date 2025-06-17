// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const path = require("path");

dotenv.config();
require("./config/passport-setup");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === "production" 
    ? process.env.FRONTEND_URL || false  // In production, frontend is served by same server
    : process.env.CLIENT_URL || "http://localhost:5173", // In development, allow local frontend
  credentials: true,
};

app.use(cors(corsOptions));
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

// Health check endpoint (no auth required)
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime()
  });
});

// Serve static files from React build
const buildPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(buildPath));

// Serve React app for all non-API routes (SPA routing)
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API endpoint not found" });
  }
  res.sendFile(path.join(buildPath, "index.html"));
});

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
