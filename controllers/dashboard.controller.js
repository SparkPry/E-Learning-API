const db = require("../db");

exports.getDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    /* =============================
       ENROLLED COURSES
    ============================== */
    const [courses] = await db.query(
      `
      SELECT e.course_id, c.title
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      WHERE e.student_id = ?
      `,
      [studentId]
    );

    /* =============================
       COURSE PROGRESS
    ============================== */
    const [progressRows] = await db.query(
      `
      SELECT
        l.course_id,
        COUNT(l.id) AS total_lessons,
        SUM(lp.completed = 1) AS completed_lessons
      FROM lessons l
      LEFT JOIN lesson_progress lp
        ON lp.lesson_id = l.id
        AND lp.student_id = ?
      GROUP BY l.course_id
      `,
      [studentId]
    );

    const progressMap = {};
    progressRows.forEach(p => {
      progressMap[p.course_id] =
        p.total_lessons === 0
          ? 0
          : (p.completed_lessons / p.total_lessons) * 100;
    });

    const coursesWithProgress = courses.map(c => ({
      courseId: c.course_id,
      title: c.title,
      progress: Number((progressMap[c.course_id] || 0).toFixed(1)),
    }));

    /* =============================
       STATS
    ============================== */
    const ongoingCourses = coursesWithProgress.filter(
      c => c.progress < 100
    ).length;

    const completionRate =
      coursesWithProgress.length === 0
        ? 0
        : (
            coursesWithProgress.reduce((s, c) => s + c.progress, 0) /
            coursesWithProgress.length
          ).toFixed(1);

    /* =============================
       CARDS TODAY
    ============================== */
    const [today] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM lesson_progress
      WHERE student_id = ?
        AND completed = 1
        AND DATE(completed_at) = CURDATE()
      `,
      [studentId]
    );

    /* =============================
       STREAK
    ============================== */
    const [days] = await db.query(
      `
      SELECT DISTINCT DATE(completed_at) AS day
      FROM lesson_progress
      WHERE student_id = ?
        AND completed = 1
      ORDER BY day DESC
      `,
      [studentId]
    );

    let streak = 0;
    let current = new Date();

    for (const row of days) {
      const d = new Date(row.day);
      const diff = Math.floor((current - d) / 86400000);
      if (diff === streak) {
        streak++;
      } else {
        break;
      }
    }

    /* =============================
       RESPONSE
    ============================== */
    res.json({
      stats: {
        ongoingCourses,
        cardsToday: today[0].total,
        streak,
        completionRate: Number(completionRate),
      },
      courses: coursesWithProgress,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard error" });
  }
};
