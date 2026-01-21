const db = require("../db");
// Constructor add lessons
exports.addLesson = (req, res) => {
  if (req.user.role !== "instructor") {
    return res
      .status(403)
      .json({ message: "Only instructors can add lessons" });
  }

  const { slug, title, content_type, content, duration, lesson_order, is_free } = req.body;
  const courseId = req.params.courseId;

  const sql = `
    INSERT INTO lessons (course_id, slug, title, content_type, content, duration, lesson_order, is_free)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      courseId,
      slug || null,
      title || null,
      content_type || null,
      content || null,
      duration || null,
      lesson_order || 0,
      is_free || false
    ],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Lesson added successfully", lessonId: result.insertId });
    }
  );
};

exports.getLessons = (req, res) => {
  const courseId = req.params.courseId;
  const userId = req.user.id;
  const role = req.user.role;

  // Instructor can see all lessons
  if (role === "instructor") {
    return getLessonsWithProgress(courseId, null, res);
  }

  // Student: check enrollment first
  const checkSql = `
    SELECT * FROM enrollments
    WHERE student_id = ? AND course_id = ?
  `;

  db.query(checkSql, [userId, courseId], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(403).json({
        message: "You must enroll to view lessons"
      });
    }

    getLessonsWithProgress(courseId, userId, res);
  });
};

// helper
function getLessonsWithProgress(courseId, studentId, res) {
  let sql;
  let params;

  if (studentId) {
    sql = `
      SELECT l.id, l.title, l.video_url, l.content,
             IF(lp.completed = 1, 1, 0) AS completed
      FROM lessons l
      LEFT JOIN lesson_progress lp
        ON l.id = lp.lesson_id AND lp.student_id = ?
      WHERE l.course_id = ?
    `;
    params = [studentId, courseId];
  } else {
    sql = "SELECT * FROM lessons WHERE course_id = ?";
    params = [courseId];
  }

  db.query(sql, params, (err, lessons) => {
    if (err) return res.status(500).json(err);
    res.json(lessons);
  });
}





//  Make the lesson Completed
exports.markLessonComplete = (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Students only" });
  }

  const studentId = req.user.id;
  const lessonId = req.params.lessonId;

  const sql = `
    INSERT INTO lesson_progress (student_id, lesson_id, completed, completed_at)
    VALUES (?, ?, 1, NOW())
  `;

  db.query(sql, [studentId, lessonId], (err) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Lesson marked as completed" });

    checkCourseCompletion(studentId, lessonId);


  });
};


exports.deleteLesson = (req, res) => {
  if (req.user.role !== "instructor" && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only instructors and admins can delete lessons" });
  }

  const lessonId = req.params.lessonId;
  const courseId = req.params.courseId;

  // Verify the lesson belongs to the specified course
  const verifySql = "SELECT l.id FROM lessons l INNER JOIN courses c ON l.course_id = c.id WHERE l.id = ? AND l.course_id = ?";
  
  db.query(verifySql, [lessonId, courseId], (err, result) => {
    if (err) return res.status(500).json(err);
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Lesson not found in this course" });
    }

    // If instructor, verify ownership
    if (req.user.role === "instructor") {
      const ownershipSql = "SELECT c.instructor_id FROM lessons l INNER JOIN courses c ON l.course_id = c.id WHERE l.id = ? AND c.instructor_id = ?";
      db.query(ownershipSql, [lessonId, req.user.id], (err, ownerResult) => {
        if (err) return res.status(500).json(err);
        
        if (ownerResult.length === 0) {
          return res.status(403).json({ message: "You can only delete lessons from your own courses" });
        }

        deleteThisLesson();
      });
    } else {
      // Admin can delete any lesson
      deleteThisLesson();
    }
  });

  function deleteThisLesson() {
    // Delete lesson progress records first
    const deleteProgressSql = "DELETE FROM lesson_progress WHERE lesson_id = ?";
    db.query(deleteProgressSql, [lessonId], (err) => {
      if (err) return res.status(500).json(err);

      // Delete the lesson
      const deleteSql = "DELETE FROM lessons WHERE id = ?";
      db.query(deleteSql, [lessonId], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Lesson deleted successfully" });
      });
    });
  }
};

const checkCourseCompletion = (studentId, lessonId) => {
  // get course_id from lesson
  const courseSql = "SELECT course_id FROM lessons WHERE id = ?";
  db.query(courseSql, [lessonId], (err, lessonResult) => {
    if (err || lessonResult.length === 0) return;

    const courseId = lessonResult[0].course_id;

    // count total lessons
    const totalSql = "SELECT COUNT(*) AS total FROM lessons WHERE course_id = ?";
    db.query(totalSql, [courseId], (err, totalResult) => {
      if (err) return;

      const totalLessons = totalResult[0].total;

      // count completed lessons
      const completedSql = `
        SELECT COUNT(*) AS completed
        FROM lesson_progress
        WHERE student_id = ? AND lesson_id IN (
          SELECT id FROM lessons WHERE course_id = ?
        )
      `;

      db.query(completedSql, [studentId, courseId], (err, completedResult) => {
        if (err) return;

        if (completedResult[0].completed === totalLessons) {
          const insertSql = `
            INSERT IGNORE INTO course_completion (student_id, course_id)
            VALUES (?, ?)
          `;
          db.query(insertSql, [studentId, courseId]);
        }
      });
    });
  });
};

