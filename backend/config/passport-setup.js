// backend/config/passport-setup.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const result = await pool.query('SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1', [id]);
        if (result.rows.length === 0) {
            return done(new Error('User not found.'));
        }
        const user = result.rows[0];
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        proxy: true
    }, 
    async (accessToken, refreshToken, profile, done) => {
        const { id, displayName, emails } = profile;
        const email = emails[0].value;
        const client = await pool.connect(); // Use a client for transactions

        try {
            const existingUserResult = await client.query('SELECT * FROM users WHERE google_id = $1', [id]);
            
            if (existingUserResult.rows.length > 0) {
                // User already exists, proceed to log in.
                return done(null, existingUserResult.rows[0]);
            }
            
            const existingEmailResult = await client.query("SELECT * FROM users WHERE email = $1 AND provider = 'local'", [email]);
            if (existingEmailResult.rows.length > 0) {
                return done(new Error('This email is already registered locally. Please log in with your password.'), null);
            }

            // --- FIX: Create both user and teacher in a single transaction ---
            await client.query('BEGIN');

            // Step 1: Create the user in the 'users' table
            // Default new Google sign-ups to the 'user' role (ID 2)
            const newUserQuery = `
                INSERT INTO users (username, email, google_id, provider, role_id) 
                VALUES ($1, $2, $3, 'google', 2) RETURNING *`; 
            const newUserResult = await client.query(newUserQuery, [displayName, email, id]);
            const newUser = newUserResult.rows[0];

            // Step 2: Create the corresponding teacher in the 'teachers' table
            const teacherQuery = `
                INSERT INTO teachers (name, email, user_id) 
                VALUES ($1, $2, $3)`;
            await client.query(teacherQuery, [displayName, email, newUser.id]);
            
            await client.query('COMMIT');
            
            return done(null, newUser);

        } catch (err) {
            await client.query('ROLLBACK');
            return done(err, null);
        } finally {
            client.release();
        }
    })
);
