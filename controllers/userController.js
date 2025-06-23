const User = require("../models/user.models");
const jwt = require("jsonwebtoken");
const handleErrors = require("../services/handleErrors");
const { cloudinary } = require("../config/cloudinary.config");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const fs = require("fs");

const Worker=require("../models/worker.model")
const Return = require("../models/return.model");
const Production = require("../models/production.model");
const PInvestment = require("../models/pinvestment.model");
const Partner = require("../models/partener.model");
const Investment = require("../models/investment.model");
const WorkerAttendance = require("../models/attendance.model");
const History = require("../models/history.model");

require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const userRegister = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(handleErrors(400, "All fields are required!"));
    }

    const existingUser = await User.findOne({ email });

    const otp = crypto.randomInt(100000, 999999).toString();

    if (existingUser) {
      if (existingUser.isVerify) {
        return next(handleErrors(400, "Email is already registered!"));
      } else {
        existingUser.name = name;
        existingUser.password = password;
        existingUser.otp = otp;
        await existingUser.save();
      }
    } else {
      const newUser = new User({
        name,
        email,
        password,
        isVerify: false,
        otp,
      });
      await newUser.save();
    }

    // Send OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Verify Your Email",
      text: `
    To sign in to your account, please use the following One-Time Password (OTP):
    
    ${otp}
    
    This code is valid for the next 10 minutes. Do not share it with anyone.
    
    Regards,  
    Team KRANTI
      `.trim(), // trim removes leading/trailing whitespace
    });

    res.status(201).json({
      success: true,
      message: "OTP sent to your email!",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    next(handleErrors(500, "Something went wrong, please try again!"));
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) return res.status(400).json({ message: "User not found!" });
    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP!" });

    user.isVerify = true;
    user.otp = null;

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    user.token = token;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Email Verified and Logged In Successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Email Verification Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(handleErrors(400, "All fields are required!"));
    }

    const findUser = await User.findOne({ email }).select("+password");
    if (!findUser || !findUser.isVerify) {
      return next(
        handleErrors(
          404,
          "User not found, please register first! and verify email"
        )
      );
    }

    const isPasswordValid = await findUser.comparePassword(password);
    if (!isPasswordValid) {
      return next(handleErrors(400, "Invalid email or password!"));
    }

    const token = jwt.sign(
      { id: findUser._id, name: findUser.name },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    if (!findUser.token || findUser.token !== token) {
      findUser.token = token;
      await findUser.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success: true,
      message: "Login successful!",
      user: {
        id: findUser._id,
        name: findUser.name,
        email: findUser.email,
      },
      token,
    });
  } catch (error) {
    next(handleErrors(500, "Something went wrong, please try again!"));
  }
};

const showProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(handleErrors(401, "Unauthorized! Please log in."));
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return next(handleErrors(404, "User not found!"));
    }

    res.status(200).json({
      success: true,
      name: user.name,
      email: user.email,
      image: user.image,
      mobile_number: user.mobile_number,
      location: user.location,
    });
  } catch (error) {
    return next(handleErrors(500, error.message || "Server Error!"));
  }
};

const passwordChange = async (req, res, next) => {
  try {
    const { updatedPassword, password } = req.body;

    if (!updatedPassword || !password) {
      return next(handleErrors(400, "Both old and new passwords are required"));
    }

    const userId = req.user.id;

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return next(handleErrors(404, "User not found"));
    }

    const isSamePassword = await user.comparePassword(updatedPassword);

    if (isSamePassword) {
      return next(
        handleErrors(400, "New password must be different from old password")
      );
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return next(handleErrors(400, "Old password is incorrect"));
    }

    user.password = updatedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password Change Error:", error);
    return next(handleErrors(500, "Server error"));
  }
};

const verifyUser = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(handleErrors(401, "Unauthorized! Please log in."));
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return next(handleErrors(404, "User not found!"));
    }

    res.status(200).json({
      success: true,
      token: user.token,
    });
  } catch (error) {
    return next(handleErrors(500, error.message || "Server Error!"));
  }
};

const logoutUser = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(handleErrors(401, "Unauthorized! Please log in."));
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return next(handleErrors(404, "User not found!"));
    }

    user.token = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logout successful!",
    });
  } catch (error) {
    return next(handleErrors(500, error.message || "Server Error!"));
  }
};

const updateProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(handleErrors(401, "Unauthorized! Please log in."));
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return next(handleErrors(404, "User not found!"));
    }

    // Update fields if provided
    const { location, mobile_number } = req.body;

    if (location) {
      user.location = location;
    }

    if (mobile_number) {
      const mobileStr = mobile_number.toString();
      if (mobileStr.length !== 10) {
        return next(handleErrors(400, "Mobile number must be 10 digits"));
      }
      user.mobile_number = mobile_number;
    }

    // Handle image upload if file is present
    if (req.file) {
      try {
        if (user.image && user.public_id) {
          await cloudinary.uploader.destroy(user.public_id);
        }

        user.image = req.file.path;
        user.public_id = req.file.filename;
      } catch (imgErr) {
        console.error("Image upload failed:", imgErr.message);
      }
    }

    await user.save(); // Save updated user data

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        name: user.name,
        email: user.email,
        location: user.location,
        mobile_number: user.mobile_number,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Error in updateProfile:", error.message);
    return next(handleErrors(500, "Server Error!"));
  }
};


const deleteUserAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    
    const deletionResults = await Promise.allSettled([
      Worker.deleteMany({ current_userId: userId }),
      Return.deleteMany({ current_userId: userId }),
      Production.deleteMany({ current_userId: userId }),
      PInvestment.deleteMany({ current_userId: userId }),
      Partner.deleteMany({ current_userId: userId }),
      Investment.deleteMany({ current_userId: userId }),
      History.deleteMany({ current_userId: userId }),
      WorkerAttendance.deleteMany({ current_userId: userId })
    ]);

    // Optional: Log any failed deletions
    deletionResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Error deleting related model at index ${index}:`, result.reason);
      }
    });

    // Delete the user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "User account and all related data deleted successfully ."
    });

  } catch (error) {
    console.error("Delete Account Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong Delete account. Please try again.  ",
    });
  }
};


module.exports = {
  userRegister,
  userLogin,
  updateProfile,
  showProfile,
  passwordChange,
  verifyUser,
  logoutUser,
  verifyEmail,
  deleteUserAccount
};
