const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    userImage: {
      type: String,
      default: "https://res.cloudinary.com/dzymhjyvm/image/upload/v1719582689/user_zs74s3.jpg",
    },
    gender: {
      type: String,
      enum: ["male", "female", "diverse"],
    },
    drawings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Drawing",
      },
    ],
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
