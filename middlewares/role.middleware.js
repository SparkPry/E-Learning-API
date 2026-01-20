exports.isInstructorOrAdmin = (req, res, next) => {
  const role = req.user.role;
  if (role === "instructor" || role === "admin") {
    next(); // allowed
  } else {
    res.status(403).json({ message: "Access denied: Only instructor or admin" });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role === "admin") {
    next(); // allowed
  } else {
    res.status(403).json({ message: "Access denied: Admin only" });
  }
};
