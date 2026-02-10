const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const enrollmentRoutes = require("./routes/enrollment.routes");
const lessonRoutes = require("./routes/lesson.routes");
const adminRoutes = require("./routes/admin.routes");
const studentRoutes = require("./routes/student.routes");
const app = express();

// Security Middleware
// Add security headers
app.use(helmet());

// Configure CORS - restrict to specific origin(s)
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit auth attempts to 5 per 15 minutes
  message: 'Too many login attempts, please try again later.'
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use(limiter); // General rate limiter

// Routes
app.use("/api/auth", authLimiter, authRoutes); // Stricter rate limit on auth
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api", lessonRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/student", studentRoutes);
const swaggerSetup = require("./swagger");
swaggerSetup(app);

app.get("/", (req, res) => {
  res.send("E-Learning API running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
