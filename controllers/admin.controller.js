const db = require("../db");

exports.createCourse = (req, res) => {
  const {
    slug,
    title,
    description,
    long_description,
    price,
    discount_price,
    level,
    category,
    language,
    duration,
    thumbnail,
    instructor_id,
    status
  } = req.body;

  // Determine instructor_id
  let instructorId = instructor_id || null;
  if (req.user.role === "instructor") {
    instructorId = req.user.id; // only instructors get their ID
  }

  const sql = `
    INSERT INTO courses (slug, title, description, long_description, price, discount_price, level, category, language, duration, thumbnail, instructor_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [
      slug || null,
      title || null,
      description || null,
      long_description || null,
      price || 0,
      discount_price || null,
      level || null,
      category || null,
      language || null,
      duration || null,
      thumbnail || null,
      instructorId,
      status || "draft"
    ],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Course created", courseId: result.insertId });
    }
  );
};

exports.updateCourse = (req, res) => {
  const {
    slug,
    title,
    description,
    long_description,
    price,
    discount_price,
    level,
    category,
    language,
    duration,
    thumbnail,
    status
  } = req.body;
  const courseId = req.params.courseId;

  const sql = `UPDATE courses SET 
    slug = ?, 
    title = ?, 
    description = ?, 
    long_description = ?, 
    price = ?, 
    discount_price = ?, 
    level = ?, 
    category = ?, 
    language = ?, 
    duration = ?, 
    thumbnail = ?, 
    status = ? 
  WHERE id = ?`;
  db.query(
    sql,
    [
      slug,
      title,
      description,
      long_description,
      price || 0,
      discount_price,
      level,
      category,
      language,
      duration,
      thumbnail,
      status,
      courseId
    ],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Course updated successfully" });
    }
  );
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
  const {
    slug,
    title,
    content_type,
    content_url,
    duration,
    lesson_order,
    is_free
  } = req.body;
  const courseId = req.params.courseId;

  const sql = `INSERT INTO lessons (course_id, slug, title, content_type, content, duration, lesson_order, is_free) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    sql,
    [
      courseId,
      slug || null,
      title || null,
      content_type || null,
      content || null,
      duration || null,
      lesson_order || null,
      is_free || false
    ],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Lesson created", lessonId: result.insertId });
    }
  );
};

exports.updateLesson = (req, res) => {
  const {
    slug,
    title,
    content_type,
    content,
    duration,
    lesson_order,
    is_free
  } = req.body;
  const lessonId = req.params.lessonId;

  const sql = `UPDATE lessons SET 
    slug = ?, 
    title = ?, 
    content_type = ?, 
    content = ?, 
    duration = ?, 
    lesson_order = ?, 
    is_free = ? 
  WHERE id = ?`;
  db.query(
    sql,
    [
      slug,
      title,
      content_type,
      content,
      duration,
      lesson_order,
      is_free,
      lessonId
    ],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Lesson updated successfully" });
    }
  );
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
