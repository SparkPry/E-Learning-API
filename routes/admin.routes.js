const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middlewares/auth.middleware");
const {
  createCourse,
  updateCourse,
  deleteCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  listUsers
} = require("../controllers/admin.controller");

// Courses
router.post("/courses", verifyToken, verifyAdmin, createCourse);
router.put("/courses/:courseId", verifyToken, verifyAdmin, updateCourse);
router.delete("/courses/:courseId", verifyToken, verifyAdmin, deleteCourse);

// Lessons
router.post("/courses/:courseId/lessons", verifyToken, verifyAdmin, createLesson);
router.put("/lessons/:lessonId", verifyToken, verifyAdmin, updateLesson);
router.delete("/lessons/:lessonId", verifyToken, verifyAdmin, deleteLesson);

// Users
router.get("/users", verifyToken, verifyAdmin, listUsers);

module.exports = router;
