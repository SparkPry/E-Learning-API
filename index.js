const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const enrollmentRoutes = require("./routes/enrollment.routes");
const lessonRoutes = require("./routes/lesson.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();
app.get('/test-db', (req, res) => {
  connection.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('DB connection failed: ' + err.message);
    }
    res.send('DB works! Result: ' + results[0].solution);
  });
});


app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api", lessonRoutes);
app.use("/api/admin", adminRoutes);

const swaggerSetup = require("./swagger");
swaggerSetup(app);

app.get("/", (req, res) => {
  res.send("E-Learning API running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
