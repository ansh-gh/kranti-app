const jwt = require("jsonwebtoken");
require("dotenv").config();
const handleErrors = require("../services/handleErrors");
const User = require("../models/user.models");
const authUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    

    if (!token) {
      return next(
        handleErrors(401, "Unauthorized: Token not found, please login")
      );
    }
    const tokenValue = token.split(" ")[1];
    // console.log(tokenValue)
    const Key = process.env.JWT_SECRET;

    const decoded = jwt.verify(tokenValue, Key);
    // console.log(decoded)
    const id = decoded.id;
    // console.log(id)

    const user = await User.findById(id);
    if (!user) {
      return next(handleErrors(404, "User not found, please register"));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(handleErrors(401, "Invalid Token or Session Expired"));
  }
};

module.exports = authUser;
