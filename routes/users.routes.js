const router = require("express").Router();
const User = require("../models/User.model");

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    console.log(users);
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "There was an error while fetching the users" });
  }
});

module.exports = router;
