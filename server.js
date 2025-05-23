const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");

require("dotenv").config();

const app = express();
app.use(express.json());

// Enable CORS for all routes and origins
app.use(cors());

// JWT Auth middleware


app.use((req, res, next) => {
  if (
    req.path === "/post/get" || 
    req.path === "/user/signup" || 
    req.path === "/user/login"
  ) {
    return next(); // skip auth for public routes
  }

  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // ✅ user ID now accessible
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
});


// Routes
app.use("/user", userRoutes);
app.use("/post", postRoutes);

// Simple test route
app.get("/", (req, res) => {
  res.send("Server is working ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
