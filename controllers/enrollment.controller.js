const db = require("../db");

// Enroll in a course
exports.enrollInCourse = (req, res) => {
  const studentId = req.user.id;
  const courseId = req.params.courseId;

  // Only students can enroll
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Only students can enroll" });
  }

  const sql = "INSERT INTO enrollments (course_id, student_id) VALUES (?, ?)";

  db.query(sql, [courseId, studentId], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Already enrolled" });
      }
      return res.status(500).json(err);
    }

    res.json({ message: "Enrolled successfully" });
  });
};

// Get all enrollments of logged-in student
exports.getMyEnrollments = (req, res) => {
  const studentId = req.user.id;

  const sql = `
    SELECT e.id, c.id as course_id, c.title, c.description, c.price, c.instructor_id, e.enrolled_at
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE e.student_id = ?
  `;

  db.query(sql, [studentId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};
