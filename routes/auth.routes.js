const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful
 */




/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: register user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                type: string
 *                example: Joe deo
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               role:
 *                type: string
 *                example: Student
 *     responses:
 *       200:
 *         description: Register Succesful
 */
const {
  register,
  login
} = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);


// ✅ CURRENT USER
router.get("/me", verifyToken, async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, name, email, role FROM users WHERE id = ?",
    [req.user.id]
  );

  res.json(rows[0]);
});


module.exports = router;
