// backend/config/passport-setup.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("./db");

/**
 * Serializes the user object to the session.
 * Stores only the user ID to keep the session lightweight.
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/**
 * Deserializes the user from the session using the stored ID.
 * Fetches the full user object from the database on each request.
 */
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      "SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return done(new Error("User not found."));
    }
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

/**
 * Configures the Google OAuth 2.0 strategy for Passport.
 * This function is called when a user attempts to log in with Google.
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback", // Must match the URI in Google Cloud Console
      proxy: true, // Necessary if your app is behind a proxy (like Heroku, etc.)
    },
    /**
     * This verify callback is triggered after Google successfully authenticates the user.
     * It receives the user's profile and calls 'done' to complete the login.
     * @param {string} accessToken - Google access token.
     * @param {string} refreshToken - Google refresh token.
     * @param {object} profile - The user's profile information from Google.
     * @param {function} done - The callback to complete the authentication process.
     */
    async (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails } = profile;
      const email = emails[0].value;

      try {
        // 1. Check if user already exists with this Google ID
        const existingUserResult = await pool.query(
          "SELECT * FROM users WHERE google_id = $1",
          [id]
        );
        if (existingUserResult.rows.length > 0) {
          return done(null, existingUserResult.rows[0]);
        }

        // 2. Check if the email is already registered through a local password account
        const existingEmailResult = await pool.query(
          "SELECT * FROM users WHERE email = $1 AND provider = 'local'",
          [email]
        );
        if (existingEmailResult.rows.length > 0) {
          return done(
            new Error(
              "This email is already registered locally. Please log in with your password."
            ),
            null
          );
        }

        // 3. If user is new, create them in the database
        // Defaults all new Google sign-ups to the 'user' role (ID 3)
        const newUserQuery = `
                INSERT INTO users (username, email, google_id, provider, role_id) 
                VALUES ($1, $2, $3, 'google', 3) RETURNING *`;
        const newUserResult = await pool.query(newUserQuery, [
          displayName,
          email,
          id,
        ]);

        return done(null, newUserResult.rows[0]);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
