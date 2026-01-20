const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { enrollInCourse, getMyEnrollments } = require("../controllers/enrollment.controller");

// Student views their enrollments
router.get("/my", verifyToken, getMyEnrollments);

// Student enrolls in a course
router.post("/:courseId", verifyToken, enrollInCourse);

module.exports = router;
