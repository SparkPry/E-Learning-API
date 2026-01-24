const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/auth.middleware");
const { getDashboard } = require("../controllers/dashboard.controller");


// Dashboard
router.get("/dashboard", verifyToken, getDashboard);
module.exports = router;
