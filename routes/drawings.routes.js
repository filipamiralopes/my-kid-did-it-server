const router = require("express").Router();
const Drawing = require("../models/Drawing.model");
const User = require("../models/User.model");
const uploader = require("../middleware/cloudinary.config.js");

router.post("/upload", uploader.single("drawingUrl"), async (req, res, next) => {
  if (!req.body.drawingUrl) {
    console.log("there was an error uploading the drawing");
    next(new Error("No drawing uploaded!"));
    return;
  }

  try {
    const drawingToCreate = {
      title: req.body.title,
      file: req.body.file,
      author: req.body.author,
      // orders?
    };
    const createdDrawing = await Drawing.create(drawingToCreate);
    await createdDrawing.save();

    // save drawings to respective user in the DB
    await User.findByIdAndUpdate(
      req.body.author,
      { $push: { drawings: createdDrawing._id } },
      { new: true, useFindAndModify: false }
    );

    console.log("Drawing uploaded!", createdDrawing);
    res.status(201).json(createdDrawing);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
