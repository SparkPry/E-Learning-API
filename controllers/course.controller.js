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

  const {
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
    slug,
    status
  } = req.body;

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
      req.user.id,
      status || "draft"
    ],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Course created successfully", courseId: result.insertId });
    }
  );
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
  if (req.user.role !== "instructor" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Only instructors and admins can update courses" });
  }

  const courseId = req.params.courseId;

  const {
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
    slug,
    status
  } = req.body;

  const sql = `
    UPDATE courses
    SET title = ?, description = ?, long_description = ?, price = ?, discount_price = ?, level = ?, category = ?, language = ?, duration = ?, thumbnail = ?, slug = ?, status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
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
      slug || null,
      status || "draft",
      courseId
    ],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Course updated successfully" });
    }
  );
};

// DELETE COURSE
exports.deleteCourse = (req, res) => {
  if (req.user.role !== "instructor" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Only instructors and admins can delete courses" });
  }

  const courseId = req.params.courseId;

  // If instructor, verify course ownership
  if (req.user.role === "instructor") {
    const verifySql = "SELECT id FROM courses WHERE id = ? AND instructor_id = ?";
    db.query(verifySql, [courseId, req.user.id], (err, result) => {
      if (err) return res.status(500).json(err);
      
      if (result.length === 0) {
        return res.status(403).json({ message: "You can only delete your own courses" });
      }

      deleteThisCourse();
    });
  } else {
    // Admin can delete any course
    deleteThisCourse();
  }

  function deleteThisCourse() {
    // Delete lesson progress records
    const deleteProgressSql = `
      DELETE lp FROM lesson_progress lp
      INNER JOIN lessons l ON lp.lesson_id = l.id
      WHERE l.course_id = ?
    `;
    db.query(deleteProgressSql, [courseId], (err) => {
      if (err) return res.status(500).json(err);

      // Delete enrollments
      const deleteEnrollmentsSql = "DELETE FROM enrollments WHERE course_id = ?";
      db.query(deleteEnrollmentsSql, [courseId], (err) => {
        if (err) return res.status(500).json(err);

        // Delete course completion records
        const deleteCompletionSql = "DELETE FROM course_completion WHERE course_id = ?";
        db.query(deleteCompletionSql, [courseId], (err) => {
          if (err) return res.status(500).json(err);

          // Delete lessons
          const deleteLessonsSql = "DELETE FROM lessons WHERE course_id = ?";
          db.query(deleteLessonsSql, [courseId], (err) => {
            if (err) return res.status(500).json(err);

            // Delete the course
            const deleteCourseSql = "DELETE FROM courses WHERE id = ?";
            db.query(deleteCourseSql, [courseId], (err) => {
              if (err) return res.status(500).json(err);
              res.json({ message: "Course deleted successfully" });
            });
          });
        });
      });
    });
  }
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
