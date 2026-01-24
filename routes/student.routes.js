const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/auth.middleware");
const { dashboardController } = require("../controllers/dashboard.controller");


// Dashboard
router.get("/dashboard", verifyToken, dashboardController);

module.exports = router;
