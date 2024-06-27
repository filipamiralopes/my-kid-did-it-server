const router = require("express").Router();
const Drawing = require("../models/Drawing.model");
const uploader = require("../middleware/cloudinary.config.js");

router.post(
  "/upload",
  uploader.single("drawingUrl"),
  async (req, res, next) => {

    if (!req.body.drawingUrl) {
      console.log("there was an error uploading the drawing");
      next(new Error("No drawing uploaded!"));
      return;
    }

    try {
      const drawingToCreate = {
        title: req.body.title,
        file: req.body.drawingUrl,
        author: req.body.author,
        // orders?
      };
      const createdDrawing = await Drawing.create(drawingToCreate);

      console.log("Drawing uploaded!", createdDrawing);
      res.status(201).json(createdDrawing);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

module.exports = router;
