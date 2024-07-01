const { Schema, model } = require("mongoose");

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    drawing: {
      type: Schema.Types.ObjectId,
      ref: "Drawing",
    },
    price: {
      type: Number,
    },
    shippingAddress: {
      type: String,
    },
    product: {
      type: String,
      enum: ["", "tshirt", "mug", "toe_bag", "beani"],
    },
    mergedImg: {
        type: String, // cloudinary path
    }
  },
  {
    timestamps: true,
  }
);

const Order = model("Order", orderSchema);

module.exports = Order;
