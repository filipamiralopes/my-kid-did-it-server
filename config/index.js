const express = require("express");
const logger = require("morgan");
const cors = require("cors");

const FRONTEND_URL = process.env.ORIGIN || "http://localhost:5173";

// Middleware configuration
module.exports = (app) => {
  app.use(express.json());
  app.use(logger("dev"));
  app.use(express.urlencoded({ extended: false }));
  app.use(
    cors({
      credentials: true,
      origin: [FRONTEND_URL],
    })
  );
};
