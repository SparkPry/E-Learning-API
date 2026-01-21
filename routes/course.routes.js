const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { isInstructorOrAdmin } = require("../middlewares/role.middleware");
const { getCertificate } = require("../controllers/course.controller");



/**
 * @swagger
 * api/courses:
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


/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags:
 *       - Courses
 *     responses:
 *       200:
 *         description: Successfully retrieved all courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: JavaScript Basics
 *                   description:
 *                     type: string
 *                     example: Learn JS fundamentals
 *                   price:
 *                     type: string
 *                     example: "19.99"
 *                   instructor_id:
 *                     type: integer
 *                     nullable: true
 *                     example: 7
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: 2026-01-17T05:22:30.000Z
 *       500:
 *         description: Server error
 */





const {
  createCourse,
  getAllCourses,
  getCourseById,
  deleteCourse
} = require("../controllers/course.controller");

// Public (students can view)
router.get("/", getAllCourses);
router.get("/:id", getCourseById);


// GET certificate for a course
router.get("/:courseId/certificate", verifyToken, getCertificate);



// Protected (instructor/admin)
router.post("/", verifyToken, isInstructorOrAdmin, createCourse);

// Instructor deletes their course
router.delete("/:courseId", verifyToken, deleteCourse);

module.exports = router;
