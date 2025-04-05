const User = require("../models/user.models");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

require("dotenv").config();


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});


const forgotPassword = async (req, res) => {
    const { email } = req.body;
    

    if (!email) return res.status(400).json({ message: "Email is required" });

    try {
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = crypto.randomInt(100000, 999999).toString();
        user.otp = otp;
        await user.save();

       
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: user.email,
            subject: "Password Reset OTP",
            html: `<h2>Your OTP is <b>${otp}</b></h2><p>Use this to reset your password. Do not share it with anyone.</p>`,
        });

        res.status(200).json({ message: "OTP sent to email" });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Verify OTP and Reset Password
const verifyOtpAndResetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword)
        return res.status(400).json({ message: "All fields are required" });

    try {
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        user.password = newPassword; 
        user.otp = null;
        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


module.exports={
    forgotPassword,
    verifyOtpAndResetPassword
}