const router = require("express").Router();
const Drawing = require("../models/Drawing.model");
const User = require("../models/User.model");
const Order = require("../models/Order.model");
const { uploadDrawing } = require("../middleware/apiUtils");


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
router.get("/user/:id", async (req, res, next) => {
  try {
    const foudUser = await User.findById(req.params.id).populate("drawings");
    res.status(200).json(foudUser.drawings);
  } catch (error) {
    console.error("Error while retrieving user's drawings ->", error);
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    // delete drawing
    const drawing = await Drawing.findByIdAndDelete(req.params.id);
    // delete also from respective user
    await User.findByIdAndUpdate(
      drawing.author,
      { $pull: { drawings: drawing._id } },
      { new: true, useFindAndModify: false }
    );
    // and orders
    if (drawing.orders && drawing.orders.length > 0) {
      console.log(drawing.orders);
      
      // Use Promise.all to handle multiple async operations
      await Promise.all(drawing.orders.map(async (orderId) => {
        try {
          await Order.findByIdAndDelete(orderId);
        } catch (error) {
          console.error(`Error deleting order ${orderId}:`, error);
        }
      }));
    }
    res.status(200).json({ message: "Drawing deleted successfuly" });
  } catch (error) {
    console.error("There was a problem while deleting the drawing: ", error);
    next(error);
  }
});

module.exports = router;
