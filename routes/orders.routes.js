const router = require("express").Router();
const Order = require("../models/Order.model");
const Drawing = require("../models/Drawing.model");
const User = require("../models/User.model");
const mergeImages = require("merge-images");
const { Canvas, Image, createCanvas, loadImage } = require("canvas");
const cloudinary = require("cloudinary").v2;
const { uploadDrawing } = require("../middleware/apiUtils");

router.post("/", async (req, res, next) => {
  try {
    const orderToCreate = {
      user: req.body.user, // id
      drawing: req.body.drawing, // id
      product: req.body.product,
      price: req.body.price,
      shippingAddress: req.body.shippingAddress,
    };
    const createdOrder = await Order.create(orderToCreate);
    await createdOrder.save();

    // save order to respective user in the DB
    await User.findByIdAndUpdate(
      req.body.user,
      { $push: { orders: createdOrder._id } },
      { new: true, useFindAndModify: false }
    );

    // save drawing to respective user in the DB
    const drawing = await Drawing.findByIdAndUpdate(
      req.body.drawing,
      { $push: { orders: createdOrder._id } },
      { new: true, useFindAndModify: false }
    );

    console.log("Order created!", createdOrder);
    res.status(201).json(createdOrder);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("/", async (req, res, next) => {
  const price = (product) => {
    const priceMap = {
      tshirt: 19.5,
      mug: 7.5,
      toe_bag: 11.5,
      beani: 11.3,
    };
    return priceMap[product];
  };

  try {
    // merge images
    let productImg = "";
    switch (req.body.product) {
      case "tshirt":
        productImg =
          "https://res.cloudinary.com/dzymhjyvm/image/upload/v1719829589/white_tshirt_eadcg2.png";
        resizedDrawingMeta = { height: 120, x: 190, y: 150 };
        break;
      case "mug":
        productImg =
          "https://res.cloudinary.com/dzymhjyvm/image/upload/v1719829589/mug_qymqid.png";
        resizedDrawingMeta = { height: 170, x: 240, y: 200 };
        break;
      case "toe_bag":
        productImg =
          "https://res.cloudinary.com/dzymhjyvm/image/upload/v1719829589/toe_bag_sq9maq.png";
        resizedDrawingMeta = { height: 120, x: 190, y: 270 };
        break;
      case "beani":
        productImg =
          "https://res.cloudinary.com/dzymhjyvm/image/upload/v1719829589/beani_bn6jna.png";
        resizedDrawingMeta = { height: 75, x: 190, y: 370 };
        break;
    }

    const drawing = await Drawing.findById(req.body.drawing);

    urlComponents = drawing.file.split("/");
    originalFile = urlComponents[urlComponents.length - 1];

    const resizedDrawing = cloudinary.url(originalFile, {
      transformation: [
        // { height: resizedDrawingMeta.height, crop: "fill" },
        { height: resizedDrawingMeta.height, width: resizedDrawingMeta.height },
        { fetch_format: "png" },
      ],
    });

    const b64 = await mergeImages(
      [
        { src: productImg, x: 0, y: 0 },
        {
          src: resizedDrawing,
          x: resizedDrawingMeta.x,
          y: resizedDrawingMeta.y,
        },
      ],
      { Canvas: Canvas, Image: Image }
    );
    // Upload mergedImg to cloudinary
    const mergedImg = await uploadDrawing(b64);

    const orderUpdates = {
      user: req.body.user, // id
      drawing: req.body.drawing, // id
      product: req.body.product,
      price: price(req.body.product),
      mergedImg: mergedImg.secure_url,
    };

    const updatedOrder = await Order.findByIdAndUpdate(
      req.body.order,
      orderUpdates,
      { new: true }
    );
    await updatedOrder.save();

    console.log("Order updated!", updatedOrder);
    res.status(201).json(updatedOrder);
  } catch (error) {
    console.log("There was a problem updating the order: ", error);
    next(error);
  }
});

router.put("/address", async (req, res, next) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.body.order,
      { shippingAddress: req.body.shippingAddress, fulfilled: true },
      { new: true }
    );
    await updatedOrder.save();

    console.log("Shipping address was added to order", updatedOrder);
    res.status(201).json(updatedOrder);
  } catch (error) {
    console.log(
      "There was a problem updating the address on the order: ",
      error
    );
    next(error);
  }
});

// Get all orders of given user
router.get("/user/:id", async (req, res, next) => {
  try {
    const foudUser = await User.findById(req.params.id).populate("orders");
    const fulfilledOrders = foudUser.orders.filter(
      (order) => order.fulfilled === true
    );
    res.status(200).json(fulfilledOrders);
  } catch (error) {
    console.error("Error while retrieving user's drawings ->", error);
    next(error);
  }
});

router.delete("/user/:id", async (req, res, next) => {
  try {
    const foudUser = await User.findById(req.params.id).populate("orders");
    const unFulfilledOrders = foudUser.orders.filter(
      (order) => order.fulfilled === false
    );
    await Order.deleteMany({
      _id: { $in: unFulfilledOrders.map((order) => order._id) },
    });
    // delete also orders from user
    await User.updateOne(
      { _id: req.params.id },
      { $pull: { orders: { $in: unFulfilledOrders } } }
    );
    console.log(
      "These unfulfilled orders were deleted --> ",
      unFulfilledOrders.map((order) => order._id)
    );
    res.status(200).json(unFulfilledOrders.map((order) => order._id));
  } catch (error) {
    console.error("Error while deleting user's unfulfilled orders ->", error);
    next(error);
  }
});

module.exports = router;
