// backend/config/passport-setup.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("./db");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

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

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id: googleId, displayName, emails } = profile;
      const email = emails[0].value;
      const client = await pool.connect(); // Use a client for transactions

      try {
        const existingUserResult = await client.query(
          "SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.google_id = $1",
          [googleId]
        );

        if (existingUserResult.rows.length > 0) {
          client.release();
          return done(null, existingUserResult.rows[0]);
        }

        const existingEmailResult = await client.query(
          "SELECT * FROM users WHERE email = $1 AND provider = 'local'",
          [email]
        );

        if (existingEmailResult.rows.length > 0) {
          client.release();
          return done(
            new Error(
              "This email is already registered locally. Please log in with your password."
            ),
            null
          );
        }

        // --- FIX: Create user and teacher in a transaction ---
        await client.query("BEGIN");

        const newUserQuery = `
          INSERT INTO users (username, email, google_id, provider, role_id) 
          VALUES ($1, $2, $3, 'google', 3) RETURNING *`;
        const newUserResult = await client.query(newUserQuery, [
          displayName,
          email,
          googleId,
        ]);
        const newUser = newUserResult.rows[0];

        const newTeacherQuery = `
          INSERT INTO teachers (user_id, name, email) 
          VALUES ($1, $2, $3)`;
        await client.query(newTeacherQuery, [newUser.id, displayName, email]);

        await client.query("COMMIT");
        
        newUser.role_name = 'user'; // Add role_name for consistency
        return done(null, newUser);
        // --- End of Fix ---

      } catch (err) {
        await client.query("ROLLBACK"); // Roll back transaction on error
        return done(err, null);
      } finally {
        client.release(); // Release the client back to the pool
      }
    }
  )
);