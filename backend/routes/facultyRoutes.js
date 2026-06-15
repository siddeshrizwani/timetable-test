// // backend/routes/facultyRoutes.js
// const express = require("express");
// const router = express.Router();
// const pool = require("../config/db");

// // This middleware will attach the teacher_id to the request object for security
// router.use(async (req, res, next) => {
//   try {
//     const teacherResult = await pool.query(
//       "SELECT teacher_id FROM teachers WHERE user_id = $1",
//       [req.user.id]
//     );
//     if (teacherResult.rows.length === 0) {
//       return res
//         .status(403)
//         .json({ msg: "Access denied. Not a registered teacher." });
//     }
//     req.teacher_id = teacherResult.rows[0].teacher_id;
//     next();
//   } catch (err) {
//     res.status(500).json({ msg: "Internal server error" });
//   }
// });

// // GET the real-time schedule for the logged-in faculty member
// router.get("/my-schedule", async (req, res) => {
//   try {
//     const query = `
//             SELECT cs.session_id, ts.day_of_week, ts.start_time, ts.end_time, s.name as subject_name, b.name as batch_name, r.room_name
//             FROM class_sessions cs
//             LEFT JOIN timeslots ts ON cs.timeslot_id = ts.timeslot_id
//             LEFT JOIN subjects s ON cs.subject_id = s.subject_id
//             LEFT JOIN batches b ON cs.batch_id = b.batch_id
//             LEFT JOIN rooms r ON cs.room_id = r.room_id
//             WHERE cs.teacher_id = $1
//             ORDER BY ts.day_of_week, ts.start_time;
//         `;
//     const scheduleResult = await pool.query(query, [req.teacher_id]);
//     res.json(scheduleResult.rows);
//   } catch (err) {
//     console.error("Error fetching faculty schedule:", err);
//     res.status(500).json({ msg: "Internal server error" });
//   }
// });

// // GET all unique courses assigned to the logged-in faculty member
// router.get("/my-courses", async (req, res) => {
//   try {
//     const query = `
//             SELECT DISTINCT ON (s.subject_id, b.batch_id)
//                 s.subject_id, s.name as subject_name, s.code as subject_code,
//                 b.batch_id, b.name as batch_name
//             FROM class_sessions cs
//             JOIN subjects s ON cs.subject_id = s.subject_id
//             JOIN batches b ON cs.batch_id = b.batch_id
//             WHERE cs.teacher_id = $1 ORDER BY s.subject_id, b.batch_id;
//         `;
//     const coursesResult = await pool.query(query, [req.teacher_id]);
//     res.json(coursesResult.rows);
//   } catch (err) {
//     console.error("Error fetching faculty courses:", err);
//     res.status(500).json({ msg: "Internal server error" });
//   }
// });

// // GET all students enrolled in a specific batch that the teacher is teaching
// router.get("/batch/:batchId/students", async (req, res) => {
//   const { batchId } = req.params;
//   try {
//     const verificationResult = await pool.query(
//       "SELECT 1 FROM class_sessions WHERE teacher_id = $1 AND batch_id = $2 LIMIT 1",
//       [req.teacher_id, batchId]
//     );
//     if (verificationResult.rowCount === 0) {
//       return res
//         .status(403)
//         .json({
//           msg: "You are not authorized to view students for this batch.",
//         });
//     }
//     const studentsQuery = `
//             SELECT s.student_id, s.name, s.email, s.roll_number
//             FROM students s
//             JOIN batch_students bs ON s.student_id = bs.student_id
//             WHERE bs.batch_id = $1 ORDER BY s.roll_number ASC;
//         `;
//     const studentsResult = await pool.query(studentsQuery, [batchId]);
//     res.json(studentsResult.rows);
//   } catch (err) {
//     console.error("Error fetching students for batch:", err);
//     res.status(500).json({ msg: "Internal server error" });
//   }
// });

// module.exports = router;

// // backend/routes/facultyRoutes.js
// const express = require("express");
// const router = express.Router();
// const pool = require("../config/db");

// // This middleware runs for ALL routes in this file.
// // It securely identifies the teacher based on their login token and attaches their teacher_id to the request.
// router.use(async (req, res, next) => {
//     try {
//         // req.user.id is the user_id from the JWT provided by the authenticateToken middleware
//         const teacherResult = await pool.query('SELECT teacher_id FROM teachers WHERE user_id = $1', [req.user.id]);
        
//         if (teacherResult.rows.length === 0) {
//             // This is a critical security check. If a user is logged in but has no teacher profile, deny access.
//             return res.status(403).json({ msg: "Access denied. Not a registered teacher." });
//         }
        
//         // Attach the teacher_id to the request object for use in subsequent routes
//         req.teacher_id = teacherResult.rows[0].teacher_id;
//         next();
//     } catch (err) {
//         console.error("Faculty route middleware error:", err);
//         res.status(500).json({ msg: "Internal server error" });
//     }
// });

// /**
//  * @route   GET /api/faculty/my-schedule
//  * @desc    Get the weekly schedule for the logged-in faculty member
//  * @access  Private (Faculty only)
//  */
// router.get("/my-schedule", async (req, res) => {
//     try {
//         const query = `
//             SELECT 
//                 cs.session_id,
//                 ts.day_of_week,
//                 ts.start_time,
//                 ts.end_time,
//                 s.name as subject_name,
//                 s.code as subject_code,
//                 b.name as batch_name,
//                 r.room_name,
//                 r.is_lab
//             FROM class_sessions cs
//             LEFT JOIN timeslots ts ON cs.timeslot_id = ts.timeslot_id
//             LEFT JOIN subjects s ON cs.subject_id = s.subject_id
//             LEFT JOIN batches b ON cs.batch_id = b.batch_id
//             LEFT JOIN rooms r ON cs.room_id = r.room_id
//             WHERE cs.teacher_id = $1
//             ORDER BY ts.slot_index; -- Order by the slot index to ensure chronological order
//         `;
//         const scheduleResult = await pool.query(query, [req.teacher_id]);
//         res.json(scheduleResult.rows);
//     } catch (err) {
//         console.error("Error fetching faculty schedule:", err);
//         res.status(500).json({ msg: "Internal server error while fetching schedule." });
//     }
// });

// /**
//  * @route   GET /api/faculty/my-courses
//  * @desc    Get all unique courses assigned to the logged-in faculty member
//  * @access  Private (Faculty only)
//  */
// router.get("/my-courses", async (req, res) => {
//     try {
//         // This query finds all unique subject/batch combinations for a teacher
//         const query = `
//             SELECT DISTINCT ON (s.subject_id, b.batch_id)
//                 s.subject_id, s.name as subject_name, s.code as subject_code,
//                 b.batch_id, b.name as batch_name
//             FROM class_sessions cs
//             JOIN subjects s ON cs.subject_id = s.subject_id
//             JOIN batches b ON cs.batch_id = b.batch_id
//             WHERE cs.teacher_id = $1 ORDER BY s.subject_id, b.batch_id;
//         `;
//         const coursesResult = await pool.query(query, [req.teacher_id]);
//         res.json(coursesResult.rows);
//     } catch (err) {
//         console.error("Error fetching faculty courses:", err);
//         res.status(500).json({ msg: "Internal server error" });
//     }
// });

// /**
//  * @route   GET /api/faculty/batch/:batchId/students
//  * @desc    Get all students enrolled in a specific batch that the teacher is teaching
//  * @access  Private (Faculty only)
//  */
// router.get("/batch/:batchId/students", async (req, res) => {
//     const { batchId } = req.params;
//     try {
//         // First, verify this teacher actually teaches this batch
//         const verificationResult = await pool.query(
//             "SELECT 1 FROM class_sessions WHERE teacher_id = $1 AND batch_id = $2 LIMIT 1",
//             [req.teacher_id, batchId]
//         );

//         if (verificationResult.rowCount === 0) {
//             return res.status(403).json({ msg: "You are not authorized to view students for this batch." });
//         }

//         // If verified, fetch the students
//         const studentsQuery = `
//             SELECT s.student_id, s.name, s.email, s.roll_number
//             FROM students s
//             JOIN batch_students bs ON s.student_id = bs.student_id
//             WHERE bs.batch_id = $1
//             ORDER BY s.roll_number ASC;
//         `;
//         const studentsResult = await pool.query(studentsQuery, [batchId]);
//         res.json(studentsResult.rows);

//     } catch (err) {
//         console.error("Error fetching students for batch:", err);
//         res.status(500).json({ msg: "Internal server error" });
//     }
// });





// backend/routes/facultyRoutes.js

const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

// ** NEW MIDDLEWARE TO ATTACH TEACHER ID **
const getTeacherId = async (req, res, next) => {
  // This middleware assumes authenticateToken has already run and attached req.user
  if (!req.user || !req.user.id) {
    return res.status(401).json({ msg: "Authentication error, user ID missing." });
  }

  try {
    const teacherResult = await pool.query(
      'SELECT teacher_id FROM teachers WHERE user_id = $1',
      [req.user.id]
    );

    if (teacherResult.rows.length === 0) {
      // This is a user who is not a teacher
      return res.status(403).json({ msg: "Access denied. User is not a registered teacher." });
    }

    // ** FIX: Attach teacher_id to the req.user object **
    req.user.teacher_id = teacherResult.rows[0].teacher_id;
    next(); // Proceed to the next middleware or the route handler

  } catch (err) {
    console.error("Error fetching teacher ID:", err);
    res.status(500).json({ msg: "Internal server error." });
  }
};


// ** UPDATED: Middleware pipeline for all faculty routes **
router.use(authenticateToken); // First, ensure user is logged in
router.use(authorizeRole(['faculty', 'admin', 'super'])); // Second, check their role
router.use(getTeacherId); // Third, get and attach their teacher_id


// GET Faculty Dashboard
router.get("/dashboard", async (req, res) => {
  try {
    // This line will now work correctly
    const teacherId = req.user.teacher_id;
    if (!teacherId) {
      // This check is now redundant but kept as a safeguard
      return res.status(400).json({ msg: "Teacher ID not found for user" });
    }

    // Query to get assigned classes (sessions)
    const scheduleQuery = `
      SELECT 
        cs.session_id,
        s.name as subject_name,
        b.name as batch_name,
        r.room_name,
        t.start_time,
        t.end_time,
        t.day_of_week
      FROM class_sessions cs
      JOIN subjects s ON cs.subject_id = s.subject_id
      JOIN batches b ON cs.batch_id = b.batch_id
      JOIN rooms r ON cs.room_id = r.room_id
      JOIN timeslots t ON cs.timeslot_id = t.timeslot_id
      WHERE cs.teacher_id = $1
      ORDER BY t.day_of_week, t.start_time;
    `;

    // Query to get general info like total courses and hours
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT cs.subject_id) as total_courses,
        COALESCE(SUM(EXTRACT(EPOCH FROM (t.end_time - t.start_time)) / 3600), 0) as total_hours
      FROM class_sessions cs
      JOIN timeslots t ON cs.timeslot_id = t.timeslot_id
      WHERE cs.teacher_id = $1;
    `;

    const [scheduleResult, statsResult] = await Promise.all([
      pool.query(scheduleQuery, [teacherId]),
      pool.query(statsQuery, [teacherId]),
    ]);

    const dashboardData = {
      schedule: scheduleResult.rows,
      stats: statsResult.rows[0]
    };

    res.json(dashboardData);
  } catch (err) {
    console.error("Error fetching faculty dashboard data:", err.message);
    res.status(500).send("Server error");
  }
});

// GET list of courses assigned to the logged-in faculty member
router.get("/my-courses", async (req, res) => {
  try {
    const teacherId = req.user.teacher_id;

    // --- FIX: Corrected the SQL query column names ---
    const query = `
        SELECT DISTINCT
            s.subject_id,
            s.code AS subject_code,      -- Use 's.code' and alias it
            s.name AS subject_name,      -- Use 's.name' and alias it
            b.name AS batch_name,
            b.batch_id,
            b.department
        FROM class_sessions cs
        JOIN subjects s ON cs.subject_id = s.subject_id
        JOIN batches b ON cs.batch_id = b.batch_id
        WHERE cs.teacher_id = $1
        ORDER BY s.name;
    `;
    const result = await pool.query(query, [teacherId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching faculty courses:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// GET details for a specific course, including the batches they teach it to
router.get("/my-courses/:subjectId", async (req, res) => {
    try {
        const { subjectId } = req.params;
        const teacherId = req.user.teacher_id;

        // First, get subject details
        const subjectQuery = `
            SELECT 
                subject_id, code as subject_code, name as subject_name, semester, lecture_credits, lab_credits 
            FROM subjects 
            WHERE subject_id = $1;
        `;
        const subjectResult = await pool.query(subjectQuery, [subjectId]);

        if (subjectResult.rows.length === 0) {
            return res.status(404).json({ msg: "Subject not found." });
        }
        const subject = subjectResult.rows[0];

        // Then, get batches this teacher teaches this subject to
        const batchesQuery = `
            SELECT DISTINCT
                b.batch_id,
                b.name as batch_name,
                b.department
            FROM class_sessions cs
            JOIN batches b ON cs.batch_id = b.batch_id
            WHERE cs.teacher_id = $1 AND cs.subject_id = $2
            ORDER BY b.name;
        `;

        const batchesResult = await pool.query(batchesQuery, [teacherId, subjectId]);
        
        const courseDetails = {
            ...subject,
            assigned_batches: batchesResult.rows
        };

        res.json(courseDetails);
    } catch (err) {
        console.error("Error fetching course details:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
});


// GET the complete timetable for the logged-in faculty member
router.get("/my-timetable", async (req, res) => {
  try {
      const teacherId = req.user.teacher_id;
      if (!teacherId) {
          return res.status(403).json({ msg: "User is not a teacher or not logged in." });
      }

      const query = `
          SELECT 
              cs.session_id,
              ts.day_of_week,
              ts.start_time,
              ts.end_time,
              s.name as subject_name,
              b.name as batch_name,
              r.room_name
          FROM class_sessions cs
          JOIN timeslots ts ON cs.timeslot_id = ts.timeslot_id
          JOIN subjects s ON cs.subject_id = s.subject_id
          JOIN batches b ON cs.batch_id = b.batch_id
          JOIN rooms r ON cs.room_id = r.room_id
          WHERE cs.teacher_id = $1
          ORDER BY ts.day_of_week, ts.start_time;
      `;
      const result = await pool.query(query, [teacherId]);

      // Group the results by day for easier rendering on the frontend
      const timetable = {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
          Sunday: [],
      };

      result.rows.forEach(session => {
          // Format time for better display
          session.start_time = new Date(`1970-01-01T${session.start_time}Z`).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
          session.end_time = new Date(`1970-01-01T${session.end_time}Z`).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
          timetable[session.day_of_week].push(session);
      });

      res.json(timetable);
  } catch (err) {
      console.error("Error fetching faculty timetable:", err);
      res.status(500).json({ msg: "Internal server error" });
  }
});

// This should be the last line in the file
module.exports = router;