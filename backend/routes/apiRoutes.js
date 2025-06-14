const express = require("express");
const router = express.Router();
const { pool } = require("../server");

// --- BATCHES API ---

// GET all batches with subject count
router.get("/batches", async (req, res) => {
  try {
    const query = `
      SELECT b.*, COUNT(bs.subject_id) AS subject_count
      FROM batches b
      LEFT JOIN batch_subjects bs ON b.batch_id = bs.batch_id
      GROUP BY b.batch_id
      ORDER BY b.name ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching batches:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// GET a single batch by ID
router.get("/batches/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const batchResult = await pool.query(
      "SELECT * FROM batches WHERE batch_id = $1",
      [id]
    );
    if (batchResult.rows.length === 0)
      return res.status(404).json({ msg: "Batch not found" });
    const subjectsResult = await pool.query(
      `SELECT s.subject_id, s.name, s.code, s.lecture_credits, s.lab_credits 
       FROM subjects s JOIN batch_subjects bs ON s.subject_id = bs.subject_id
       WHERE bs.batch_id = $1 ORDER BY s.name ASC`,
      [id]
    );
    res.json({ ...batchResult.rows[0], subjects: subjectsResult.rows });
  } catch (err) {
    console.error(`Error fetching batch ${id}:`, err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// POST a new batch
router.post("/batches", async (req, res) => {
  const { name, academic_year, semester_number, department, subject_ids } =
    req.body;
  if (
    !name ||
    !academic_year ||
    !semester_number ||
    !department ||
    !subject_ids ||
    !Array.isArray(subject_ids)
  ) {
    return res.status(400).json({ msg: "Missing required fields." });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const batchQuery =
      "INSERT INTO batches (name, academic_year, semester_number, department) VALUES ($1, $2, $3, $4) RETURNING batch_id";
    const batchResult = await client.query(batchQuery, [
      name,
      academic_year,
      semester_number,
      department,
    ]);
    const newBatchId = batchResult.rows[0].batch_id;
    if (subject_ids.length > 0) {
      const subjectPromises = subject_ids.map((subject_id) =>
        client.query(
          "INSERT INTO batch_subjects (batch_id, subject_id) VALUES ($1, $2)",
          [newBatchId, subject_id]
        )
      );
      await Promise.all(subjectPromises);
    }
    await client.query("COMMIT");
    res
      .status(201)
      .json({ msg: "Batch created successfully", batch_id: newBatchId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating batch:", err);
    if (err.code === "23505")
      return res
        .status(409)
        .json({ msg: "A batch with this name already exists." });
    res.status(500).json({ msg: "Internal server error" });
  } finally {
    client.release();
  }
});

// PUT (update) an existing batch
router.put("/batches/:id", async (req, res) => {
  const { id } = req.params;
  const { name, academic_year, semester_number, department, subject_ids } =
    req.body;
  if (
    !name ||
    !academic_year ||
    !semester_number ||
    !department ||
    !subject_ids ||
    !Array.isArray(subject_ids)
  ) {
    return res.status(400).json({ msg: "Missing required fields." });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "UPDATE batches SET name = $1, academic_year = $2, semester_number = $3, department = $4 WHERE batch_id = $5",
      [name, academic_year, semester_number, department, id]
    );
    await client.query("DELETE FROM batch_subjects WHERE batch_id = $1", [id]);
    if (subject_ids.length > 0) {
      const subjectPromises = subject_ids.map((subject_id) =>
        client.query(
          "INSERT INTO batch_subjects (batch_id, subject_id) VALUES ($1, $2)",
          [id, subject_id]
        )
      );
      await Promise.all(subjectPromises);
    }
    await client.query("COMMIT");
    res.status(200).json({ msg: "Batch updated successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(`Error updating batch ${id}:`, err);
    if (err.code === "23505")
      return res
        .status(409)
        .json({ msg: "A batch with this name already exists." });
    res.status(500).json({ msg: "Internal server error" });
  } finally {
    client.release();
  }
});

// DELETE a batch
router.delete("/batches/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM batches WHERE batch_id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ msg: "Batch not found." });
    res.status(200).json({ msg: "Batch deleted successfully." });
  } catch (err) {
    console.error(`Error deleting batch ${id}:`, err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// --- SUBJECTS API (New) ---

// GET all subjects
router.get("/subjects", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM subjects ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// POST a new subject
router.post("/subjects", async (req, res) => {
  const { name, code, lecture_credits, lab_credits } = req.body;
  if (!name || !code || lecture_credits == null || lab_credits == null) {
    return res.status(400).json({ msg: "Missing required fields." });
  }
  try {
    const query =
      "INSERT INTO subjects (name, code, lecture_credits, lab_credits) VALUES ($1, $2, $3, $4) RETURNING *";
    const result = await pool.query(query, [
      name,
      code,
      lecture_credits,
      lab_credits,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating subject:", err);
    if (err.code === "23505")
      return res
        .status(409)
        .json({ msg: "A subject with this code already exists." });
    res.status(500).json({ msg: "Internal server error" });
  }
});

// GET a single subject by ID
router.get("/subjects/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM subjects WHERE subject_id = $1",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ msg: "Subject not found." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error fetching subject ${id}:`, err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// PUT (update) an existing subject
router.put("/subjects/:id", async (req, res) => {
  const { id } = req.params;
  const { name, code, lecture_credits, lab_credits } = req.body;
  if (!name || !code || lecture_credits == null || lab_credits == null) {
    return res.status(400).json({ msg: "Missing required fields." });
  }
  try {
    const query =
      "UPDATE subjects SET name = $1, code = $2, lecture_credits = $3, lab_credits = $4 WHERE subject_id = $5 RETURNING *";
    const result = await pool.query(query, [
      name,
      code,
      lecture_credits,
      lab_credits,
      id,
    ]);
    if (result.rowCount === 0)
      return res.status(404).json({ msg: "Subject not found." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error updating subject ${id}:`, err);
    if (err.code === "23505")
      return res
        .status(409)
        .json({ msg: "A subject with this code already exists." });
    res.status(500).json({ msg: "Internal server error" });
  }
});

// DELETE a subject
router.delete("/subjects/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM subjects WHERE subject_id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ msg: "Subject not found." });
    res.status(200).json({ msg: "Subject deleted successfully." });
  } catch (err) {
    console.error(`Error deleting subject ${id}:`, err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

// --- TEACHERS API (NEW) ---

// GET all teachers
router.get("/teachers", async (req, res) => {
    try {
        const result = await pool.query("SELECT teacher_id, name, email FROM teachers ORDER BY name ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching teachers:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// POST a new teacher (and create their user login)
router.post("/teachers", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ msg: "Name, email, and a temporary password are required." });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const hashedPassword = await bcrypt.hash(password, 10);
        // Role '3' is for 'user' (faculty)
        const userQuery = 'INSERT INTO users (username, email, password_hash, role_id) VALUES ($1, $2, $3, 3) RETURNING id';
        const userResult = await client.query(userQuery, [email, email, hashedPassword]);
        const newUserId = userResult.rows[0].id;

        const teacherQuery = 'INSERT INTO teachers (name, email, user_id) VALUES ($1, $2, $3) RETURNING *';
        const teacherResult = await client.query(teacherQuery, [name, email, newUserId]);

        await client.query('COMMIT');
        res.status(201).json(teacherResult.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error creating teacher:", err);
        if (err.code === '23505') return res.status(409).json({ msg: "A user or teacher with this email already exists." });
        res.status(500).json({ msg: "Internal server error" });
    } finally {
        client.release();
    }
});

// --- ROOMS API (NEW) ---

// GET all rooms
router.get("/rooms", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM rooms ORDER BY room_name ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching rooms:", err);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// POST a new room
router.post("/rooms", async (req, res) => {
    const { room_name, capacity, is_lab } = req.body;
    if (!room_name) return res.status(400).json({ msg: "Room name is required." });
    try {
        const query = 'INSERT INTO rooms (room_name, capacity, is_lab) VALUES ($1, $2, $3) RETURNING *';
        const result = await pool.query(query, [room_name, capacity, is_lab || false]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating room:", err);
        if (err.code === '23505') return res.status(409).json({ msg: "A room with this name already exists." });
        res.status(500).json({ msg: "Internal server error" });
    }
});


module.exports = router;

