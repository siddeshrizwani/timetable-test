// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require('path');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173" || "http://localhost:52047",
    credentials: true,
  })
);


app.use(express.json());


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

app.use('/', express.static(path.join(__dirname, '../frontend/dist')));

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);

const fs = require('fs');
app.get(/^\/(?!api).*/, (req, res, next) => {
  const filePath = path.join(__dirname, '../frontend/dist', req.path);
  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
    res.sendFile(filePath);
  } else {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
});

module.exports = app; // Export the app for testing purposes