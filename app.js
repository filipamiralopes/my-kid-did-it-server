require("dotenv").config();
const express = require("express");
const app = express();

// MIDDLEWARE
require("./config")(app);

// DATABASE
require("./db");

// ROUTES
// Auth
const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);
// Drawings (isUpload field)
const drawingRoutes = require("./routes/drawings.routes");
app.use("/api/drawings", drawingRoutes);
// Orders
const orderRoutes = require("./routes/orders.routes");
app.use("/api/orders", orderRoutes);

// ERROR HANDLING
const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/error-handling");

app.use(errorHandler);
app.use(notFoundHandler);

module.exports = app;
