const router = require("express").Router();
const Drawing = require("../models/Drawing.model");
const User = require("../models/User.model");
const {uploadDrawing} = require("../middleware/apiUtils");

router.post("/upload", async (req, res, next) => {
  try {
    if (!req.body.drawingData) {
      console.log("there was an error uploading the drawing");
      next(new Error("No drawing uploaded!"));
      return;
    }
    // Upload drawing to cloudinary
    const result = await uploadDrawing(req.body.drawingData);

    const drawingToCreate = {
      title: req.body.title,
      file: result.secure_url,
      author: req.body.author,
    };
    const createdDrawing = await Drawing.create(drawingToCreate);
    await createdDrawing.save();

    // save drawing to respective user in the DB
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

// Get all drawings of given user
router.get("/user/:userId", async (req, res, next) => {
  try {
    const foudUser = await User.findById(req.params.userId).populate(
      "drawings"
    );
    res.status(200).json(foudUser.drawings);
  } catch (error) {
    console.error("Error while retrieving user's drawings ->", error);
    next(error);
  }
});

module.exports = router;
