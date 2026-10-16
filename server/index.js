require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "Server is running",
    protocol: "HTTP/1.1",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
