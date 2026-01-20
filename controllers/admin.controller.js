const db = require("../db");

exports.createCourse = (req, res) => {
  const { title, description, price } = req.body;

  // Determine instructor_id
  let instructorId = null; // default for admin
  if (req.user.role === "instructor") {
    instructorId = req.user.id; // only instructors get their ID
  }

  const sql = `
    INSERT INTO courses (title, description, price, instructor_id)
    VALUES (?, ?, ?, ?)
  `;
  db.query(
    sql,
    [title, description || null, price || 0, instructorId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Course created", courseId: result.insertId });
    }
  );
};

exports.updateCourse = (req, res) => {
  const { title, description, price } = req.body;
  const courseId = req.params.courseId;

  const sql = "UPDATE courses SET title = ?, description = ?, price = ? WHERE id = ?";
  db.query(sql, [title, description, price, courseId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Course updated successfully" });
  });
};

exports.deleteCourse = (req, res) => {
  const courseId = req.params.courseId;

  const sql = "DELETE FROM courses WHERE id = ?";
  db.query(sql, [courseId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Course deleted successfully" });
  });
};

exports.createLesson = (req, res) => {
  const { title, video_url, content } = req.body;
  const courseId = req.params.courseId;

  const sql = `INSERT INTO lessons (course_id, title, video_url, content) VALUES (?, ?, ?, ?)`;
  db.query(sql, [courseId, title, video_url || null, content || null], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Lesson created", lessonId: result.insertId });
  });
};

exports.updateLesson = (req, res) => {
  const { title, video_url, content } = req.body;
  const lessonId = req.params.lessonId;

  const sql = "UPDATE lessons SET title = ?, video_url = ?, content = ? WHERE id = ?";
  db.query(sql, [title, video_url, content, lessonId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Lesson updated successfully" });
  });
};

exports.deleteLesson = (req, res) => {
  const lessonId = req.params.lessonId;

  const sql = "DELETE FROM lessons WHERE id = ?";
  db.query(sql, [lessonId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Lesson deleted successfully" });
  });
};

exports.listUsers = (req, res) => {
  const sql = "SELECT id, name, email, role FROM users";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};
