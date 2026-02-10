


const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = (req, res) => {
  const { name, email, password, role } = req.body;

  // Input validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Validate password strength (minimum 8 characters)
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long" });
  }

  // Only allow valid roles
  const allowedRoles = ["student", "instructor", "admin"];
  const userRole = allowedRoles.includes(role) ? role : "student";

  // Use 12 salt rounds for stronger hashing
  const hashedPassword = bcrypt.hashSync(password, 12);

  const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, email, hashedPassword, userRole], (err) => {
    if (err) {
      // Check for duplicate email error
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: "Email already registered" });
      }
      return res.status(500).json({ message: "Registration failed" });
    }

    res.json({ message: `User registered successfully as ${userRole}` });
  });
};



// LOGIN
exports.login = (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Login failed" });

    // Generic message to prevent email enumeration
    const genericError = "Invalid email or password";

    if (result.length === 0) {
      return res.status(401).json({ message: genericError });
    }

    const user = result[0];

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: genericError });
    }

    // Generate JWT with secure expiry
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // More secure with defined expiry
    );

    // Return token + role ONLY (do NOT return password or sensitive data)
    res.json({
      message: "Login successful",
      token,
      role: user.role
    });
  });
};

// GET PROFILE
exports.getProfile = (req, res) => {
  const userId = req.user.id;
  const sql = "SELECT id, name, email, role FROM users WHERE id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
};