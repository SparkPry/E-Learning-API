const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { isInstructorOrAdmin } = require("../middlewares/role.middleware");
const { getCertificate } = require("../controllers/course.controller");



/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Node.js Basics
 *               description:
 *                 type: string
 *                 example: Learn backend
 *               price:
 *                 type: number
 *                 example: 0
 *     responses:
 *       200:
 *         description: Course created
 */




const {
  createCourse,
  getAllCourses,
  getCourseById
} = require("../controllers/course.controller");

// Public (students can view)
router.get("/", getAllCourses);
router.get("/:id", getCourseById);


// GET certificate for a course
router.get("/:courseId/certificate", verifyToken, getCertificate);



// Protected (instructor/admin)
router.post("/", verifyToken, isInstructorOrAdmin, createCourse);

module.exports = router;
