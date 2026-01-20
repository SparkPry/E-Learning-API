const db = require("../db");

// GET ALL COURSES
exports.getAllCourses = (req, res) => {
  db.query("SELECT * FROM courses", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// GET COURSE BY ID
exports.getCourseById = (req, res) => {
  const courseId = req.params.id;

  db.query(
    "SELECT * FROM courses WHERE id = ?",
    [courseId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0)
        return res.status(404).json({ message: "Course not found" });

      res.json(result[0]);
    }
  );
};
//  Create Course 
exports.createCourse = (req, res) => {
  if (req.user.role !== "instructor") {
    return res.status(403).json({ message: "Only instructors can create courses" });
  }

  const { title, description, price } = req.body;

  const sql = `
    INSERT INTO courses (title, description, price, instructor_id)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [title, description, price, req.user.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Course created successfully" });
  });
};



// Get Certificate
exports.getCertificate = (req, res) => {
  const studentId = req.user.id;
  const courseId = req.params.courseId;

  const sql = `
    SELECT * FROM course_completion
    WHERE student_id = ? AND course_id = ?
  `;

  db.query(sql, [studentId, courseId], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(403).json({
        message: "Course not completed yet"
      });
    }

    res.json({
      message: "Congratulations!",
      certificate: {
        student_id: studentId,
        course_id: courseId,
        completed_at: result[0].completed_at
      }
    });
  });
};

// UPDATE COURSE
exports.updateCourse = (req, res) => {
  const { title, description, price } = req.body;
  const courseId = req.params.courseId;

  if (!title || !price) {
    return res.status(400).json({ message: "Title and price required" });
  }

  const sql = "UPDATE courses SET title = ?, description = ?, price = ? WHERE id = ?";
  db.query(sql, [title, description, price, courseId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Course updated successfully" });
  });
};

// DELETE COURSE
exports.deleteCourse = (req, res) => {
  const courseId = req.params.courseId;

  const sql = "DELETE FROM courses WHERE id = ?";
  db.query(sql, [courseId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Course deleted successfully" });
  });
};

// CREATE LESSON (Admin)
exports.createLesson = (req, res) => {
  const { title, video_url, content } = req.body;
  const courseId = req.params.courseId;

  const sql = `
    INSERT INTO lessons (course_id, title, video_url, content)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [courseId, title, video_url, content], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Lesson created successfully" });
  });
};

// UPDATE LESSON (Admin)
exports.updateLesson = (req, res) => {
  const { title, video_url, content } = req.body;
  const lessonId = req.params.lessonId;

  const sql = "UPDATE lessons SET title = ?, video_url = ?, content = ? WHERE id = ?";
  db.query(sql, [title, video_url, content, lessonId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Lesson updated successfully" });
  });
};

// DELETE LESSON (Admin)
exports.deleteLesson = (req, res) => {
  const lessonId = req.params.lessonId;

  const sql = "DELETE FROM lessons WHERE id = ?";
  db.query(sql, [lessonId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Lesson deleted successfully" });
  });
};
