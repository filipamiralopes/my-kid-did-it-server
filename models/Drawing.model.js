const { Schema, model } = require("mongoose");

const drawingSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Give a title to your kiddo's work of art"],
    },
    file: { // path in cloudinary
      type: String,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    orders: [{
        type: Schema.Types.ObjectId,
        ref: "Order"
    }],
  },
  {
    timestamps: true,
  }
);

const User = model("Drawing", drawingSchema);

module.exports = Drawing;