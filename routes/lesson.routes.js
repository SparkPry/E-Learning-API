const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { addLesson, getLessons, deleteLesson } = require("../controllers/lesson.controller");
const { markLessonComplete } = require("../controllers/lesson.controller");

// Instructor adds lesson
router.post("/courses/:courseId/lessons", verifyToken, addLesson);

// View lessons
router.get("/courses/:courseId/lessons", verifyToken, getLessons);

// Instructor deletes lesson
router.delete("/courses/:courseId/lessons/:lessonId", verifyToken, deleteLesson);

// Mark lesson as completed
router.post(
  "/lessons/:lessonId/complete",
  verifyToken,
  markLessonComplete
);


module.exports = router;
