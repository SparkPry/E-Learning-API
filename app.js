const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors());
app.use(express.json());



const courseRoutes = require("./routes/course.routes");
app.use("/api/courses", courseRoutes);


const enrollmentRoutes = require("./routes/enrollment.routes");
app.use("/api/enrollments", enrollmentRoutes);

// Lesson Route 
const lessonRoutes = require("./routes/lesson.routes");
app.use("/api", lessonRoutes);


const adminRoutes = require("./routes/admin.routes");
app.use("/api/admin", adminRoutes);

const swaggerSetup = require("./swagger");
swaggerSetup(app);




// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("E-Learning API running");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

