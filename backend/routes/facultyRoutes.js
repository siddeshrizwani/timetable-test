// backend/routes/facultyRoutes.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// This middleware will attach the teacher_id to the request object for security
router.use(async (req, res, next) => {
  try {
    const teacherResult = await pool.query(
      "SELECT teacher_id FROM teachers WHERE user_id = $1",
      [req.user.id]
    );
    if (teacherResult.rows.length === 0) {
      return res
        .status(403)
        .json({ msg: "Access denied. Not a registered teacher." });
    }
    req.teacher_id = teacherResult.rows[0].teacher_id;
    next();
  } catch (err) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

// GET the real-time schedule for the logged-in faculty member
router.get("/my-schedule", async (req, res) => {
  try {
    const query = `
            SELECT cs.session_id, ts.day_of_week, ts.start_time, ts.end_time, s.name as subject_name, b.name as batch_name, r.room_name
            FROM class_sessions cs
            LEFT JOIN timeslots ts ON cs.timeslot_id = ts.timeslot_id
            LEFT JOIN subjects s ON cs.subject_id = s.subject_id
            LEFT JOIN batches b ON cs.batch_id = b.batch_id
            LEFT JOIN rooms r ON cs.room_id = r.room_id
            WHERE cs.teacher_id = $1
            ORDER BY ts.day_of_week, ts.start_time;
        `;
    const scheduleResult = await pool.query(query, [req.teacher_id]);
    res.json(scheduleResult.rows);
  } catch (err) {
    console.error("Error fetching faculty schedule:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// GET all unique courses assigned to the logged-in faculty member
router.get("/my-courses", async (req, res) => {
  try {
    const query = `
            SELECT DISTINCT ON (s.subject_id, b.batch_id)
                s.subject_id, s.name as subject_name, s.code as subject_code,
                b.batch_id, b.name as batch_name
            FROM class_sessions cs
            JOIN subjects s ON cs.subject_id = s.subject_id
            JOIN batches b ON cs.batch_id = b.batch_id
            WHERE cs.teacher_id = $1 ORDER BY s.subject_id, b.batch_id;
        `;
    const coursesResult = await pool.query(query, [req.teacher_id]);
    res.json(coursesResult.rows);
  } catch (err) {
    console.error("Error fetching faculty courses:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// GET all students enrolled in a specific batch that the teacher is teaching
router.get("/batch/:batchId/students", async (req, res) => {
  const { batchId } = req.params;
  try {
    const verificationResult = await pool.query(
      "SELECT 1 FROM class_sessions WHERE teacher_id = $1 AND batch_id = $2 LIMIT 1",
      [req.teacher_id, batchId]
    );
    if (verificationResult.rowCount === 0) {
      return res
        .status(403)
        .json({
          msg: "You are not authorized to view students for this batch.",
        });
    }
    const studentsQuery = `
            SELECT s.student_id, s.name, s.email, s.roll_number
            FROM students s
            JOIN batch_students bs ON s.student_id = bs.student_id
            WHERE bs.batch_id = $1 ORDER BY s.roll_number ASC;
        `;
    const studentsResult = await pool.query(studentsQuery, [batchId]);
    res.json(studentsResult.rows);
  } catch (err) {
    console.error("Error fetching students for batch:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;
