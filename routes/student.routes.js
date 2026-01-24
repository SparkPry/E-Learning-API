const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const dashboardController = require("../controllers/dashboard.controller");

// Dashboard
router.get("/dashboard", auth, dashboardController.getDashboard);

module.exports = router;
